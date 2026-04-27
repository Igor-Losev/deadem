<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deademx/engine
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/engine" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fengine" /></a>

**@deademx/engine** is the shared, game-agnostic Source 2 parsing and replay playback engine that powers [`deadem`](https://github.com/Igor-Losev/deadem/tree/main/packages/deadem) (Deadlock) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/tree/main/packages/dota2) (Dota 2).

It provides the packet pipeline, mutable demo state, replay player, interceptor lifecycle, broadcast client, and configuration primitives. The engine itself carries no game-specific protobuf schemas or message types — using it directly requires a prepared `SchemaRegistry`. For a ready-to-run package, install one of the implementations below.

## Contents

- [Implementations](#implementations)<br/>
  Game-specific packages built on top of the shared engine.
- [Concepts](#concepts)<br/>
  Core concepts of the parsing and playback engine.
  - [Demo](#demo)<br/>
    Structure and content of Source 2 demo packets.
  - [Parser](#parser)<br/>
    Parser lifecycle and stream processing model.
  - [Player](#player)<br/>
    Replay playback, seeking, and player state transitions.
  - [Interceptors](#interceptors)<br/>
    Hook points for inspecting and extracting data during parsing.
- [Configuration](#configuration)<br/>
  Parser configuration options and logging strategies.
  - [Parser options](#parser-options)<br/>
    Packet filtering, worker settings, and parser tuning.
  - [Logging](#logging)<br/>
    Built-in logger strategies.
- [API reference](#api-reference)<br/>
  Summary of all public exports and key methods.
- [Usage](#usage)<br/>
  Common usage patterns for replay parsing, broadcast parsing, and playback.
  - [Replay file](#replay-file)<br/>
    Parse a replay from a `.dem` file.
  - [HTTP broadcast](#http-broadcast)<br/>
    Parse a live Source 2 HTTP broadcast stream.
  - [Data extraction](#data-extraction)<br/>
    Capture data during parsing or query the final state.
  - [Playback and seeking](#playback-and-seeking)<br/>
    Seek through buffered state and run continuous playback.
- [Performance](#performance)<br/>
  How configuration choices affect parser throughput.
- [License](#license)<br/>
  Project licensing information.

## Implementations

| Package | Game | Links |
| --- | --- | --- |
| `deadem` | Deadlock | [npm](https://www.npmjs.com/package/deadem) · [docs](https://github.com/Igor-Losev/deadem/tree/main/packages/deadem) |
| `@deademx/dota2` | Dota 2 | [npm](https://www.npmjs.com/package/@deademx/dota2) · [docs](https://github.com/Igor-Losev/deadem/tree/main/packages/dota2) |

## Concepts

### Demo

A Source 2 demo is a sequential stream of outer packets, called `DemoPacket` in this project. Each has a type from [`DemoPacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js).

Most `DemoPacket` types parse into plain objects. Three types carry an array of inner `MessagePacket` values:

- `DEM_PACKET`
- `DEM_SIGNON_PACKET`
- `DEM_FULL_PACKET`

Two [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) categories require additional decoding and drive the internal game state:

- **Entities** — `SVC_PACKET_ENTITIES` contains creates, updates, and deletes.
- **String tables** — `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE`, `SVC_CLEAR_ALL_STRING_TABLES`.

The engine maintains a mutable `Demo` object that is updated tick by tick. Query it for the current state:

| Method | Returns |
| --- | --- |
| `demo.getEntities()` | All live entities |
| `demo.getEntitiesByClassName(name)` | Entities filtered by class name |
| `demo.getEntity(index)` | Entity by index |
| `demo.getEntityByHandle(handle)` | Entity by handle |
| `demo.getClasses()` | All registered entity classes |
| `demo.getClassByName(name)` | Entity class by name |
| `demo.stringTableContainer.getByName(name)` | String table by name |
| `demo.server` | Server metadata (`tickInterval`, `tickRate`, `maxClients`, `maxClasses`) |

Entities expose raw state via `entity.state` and a cached flattened view via `entity.unpackFlattened()`, which lazily materializes a plain object keyed by field name and reuses snapshots between ticks.

> [!WARNING]
> Demos carry only the minimal data required for visual playback. Not all game state is preserved, and the parser may skip packets it cannot decode. Call `parser.getStats()` (or `player.getStats()`) for detailed per-packet statistics.

### Parser

`Parser` consumes a readable stream and incrementally parses packets into an internal `Demo` instance. It overwrites past state as ticks advance and does not buffer snapshots.

```js
const parser = new Parser(registry);

await parser.parse(readable);
await parser.dispose();
```

Parsing can be paused and resumed mid-stream:

```js
parser.pause();
parser.resume();
```

### Player

`Player` is a higher-level class built on top of the same engine. Unlike `Parser`, it buffers the entire demo on `load()` and builds a packet index, enabling forward and backward seeks.

```js
const player = new Player(registry);

await player.load(readable);
await player.seekToTick(50000);

await player.nextTick();
await player.prevTick();

await player.play(2.0).catch((err) => {
    if (!(err instanceof PlaybackInterruptedError)) throw err;
});

player.pause();
await player.stop();
await player.dispose();
```

The player follows a strict state machine:

```text
IDLE
 ├── load()        → LOADED
 └── dispose()     → DISPOSED

LOADED
 ├── play()        → PLAYING
 ├── seekToTick()  → SEEKING → LOADED
 └── dispose()     → DISPOSED

PLAYING
 ├── pause() / end → LOADED
 └── dispose()     → DISPOSED

SEEKING
 ├── (completes)   → LOADED
 └── dispose()     → DISPOSED
```

| State | Description |
| --- | --- |
| `IDLE` | Initial state. Only `load()` or `dispose()` is allowed. |
| `LOADED` | Demo is buffered and indexed. Ready for seek and playback. |
| `PLAYING` | Continuous playback is running. |
| `SEEKING` | A `seekToTick()` call is in progress. |
| `DISPOSED` | Resources released. The player cannot be used further. |

The current state is exposed via `player.state`.

> [!NOTE]
> `Player` does not support `parserThreads > 0`. Constructing a player with parallel parsing throws immediately.

### Interceptors

Interceptors are user-defined hooks that run before or after specific parsing stages. They are the primary way to extract data during parsing.

`Parser` and `Player` expose the same registration API:

- `registerPreInterceptor(stage, fn)`
- `registerPostInterceptor(stage, fn)`
- `unregisterPreInterceptor(stage, fn)`
- `unregisterPostInterceptor(stage, fn)`

Three stages are supported via `InterceptorStage`:

| Stage | Hook signature |
| --- | --- |
| `DEMO_PACKET` | `(demoPacket) => void` |
| `MESSAGE_PACKET` | `(demoPacket, messagePacket) => void` |
| `ENTITY_PACKET` | `(demoPacket, messagePacket, events) => void` |

For `ENTITY_PACKET`, `events` is an array of `EntityMutationEvent` values with `{ operation, entity, mutations }`, where `operation` is an `EntityOperation` (`CREATE`, `UPDATE`, `LEAVE`, `DELETE`).

```js
import { EntityOperation, InterceptorStage, Parser } from '@deademx/engine';

parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (event.operation !== EntityOperation.UPDATE) continue;

        const changes = event.getChanges();

        if ('m_iHealth' in changes) {
            console.log(event.entity.class.name, changes.m_iHealth);
        }
    }
});
```

The parse timeline:

```text
PRE DEMO_PACKET
 └─ DEM_FILE_HEADER
POST DEMO_PACKET
...
PRE DEMO_PACKET
 └─ DEM_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ NET_TICK
     └─ POST MESSAGE_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ SVC_PACKET_ENTITIES
     │       ├─ PRE ENTITY_PACKET
     │       │   └─ ENTITY_1
     │       └─ POST ENTITY_PACKET
     │       └─ ...
     └─ POST MESSAGE_PACKET
POST DEMO_PACKET
```

> [!IMPORTANT]
> Interceptor callbacks are not awaited. Use synchronous callbacks when data must be captured before the parser advances.

## Configuration

### Parser options

`ParserConfiguration` controls packet filtering and parser tuning:

| Option | Description | Type | Default |
| --- | --- | --- | --- |
| `breakInterval` | How often, in packets, to yield to the event loop. Lower values improve responsiveness, higher values improve throughput. | `number` | `1000` |
| `entityClasses` | Allowlist of entity class names to decode from `SVC_PACKET_ENTITIES`. | `Array<string> \| null` | `null` |
| `messagePacketTypes` | Allowlist of [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) values. Mutually exclusive with `messagePacketTypesExclude`. | `Array<MessagePacketType> \| null` | `null` |
| `messagePacketTypesExclude` | Blocklist of [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) values. Mutually exclusive with `messagePacketTypes`. | `Array<MessagePacketType> \| null` | `null` |
| `parserThreads` | Number of additional worker threads. Not supported by `Player`. | `number` | `0` |

The engine always processes the following message types regardless of filters, because they drive internal state:

- `SVC_SERVER_INFO`
- `SVC_CREATE_STRING_TABLE`
- `SVC_UPDATE_STRING_TABLE`
- `SVC_CLEAR_ALL_STRING_TABLES`

Example — skip entity packets when entity data is not needed:

```js
import { MessagePacketType, Parser, ParserConfiguration } from '@deademx/engine';

const parser = new Parser(registry, new ParserConfiguration({
    messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
}));
```

Example - decoding only a subset of entity classes:

```js
import { MessagePacketType, Parser, ParserConfiguration } from '@deademx/engine';

const parser = new Parser(registry, new ParserConfiguration({
    messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ],
    entityClasses: [ 'CExampleEntityA', 'CExampleEntityB' ]
}));
```

### Logging

`Logger` ships with predefined strategies:

| Strategy | Levels emitted |
| --- | --- |
| `Logger.CONSOLE_TRACE` | trace, debug, info, warn, error |
| `Logger.CONSOLE_DEBUG` | debug, info, warn, error |
| `Logger.CONSOLE_INFO` *(default)* | info, warn, error |
| `Logger.CONSOLE_WARN` | warn, error |
| `Logger.NOOP` | (nothing) |

```js
import { Logger, Parser, ParserConfiguration } from '@deademx/engine';

const parser = new Parser(registry, ParserConfiguration.DEFAULT, Logger.CONSOLE_WARN);
```

## API reference

| Export | Purpose |
| --- | --- |
| `Parser` | Streaming parser over a `Readable`. |
| `Player` | Buffered replay player with seek and playback. |
| `ParserConfiguration` | Parser options (filters, threads, break interval). |
| `SchemaRegistry` | Registry of protobuf types. Required by `Parser` and `Player`. |
| `Bootstrap` | Populates a `SchemaRegistry` with engine-level types. |
| `BroadcastAgent` | Polls Source 2 HTTP broadcast fragments. |
| `BroadcastGateway` | Low-level HTTP client for broadcast endpoints. |
| `Printer` | Prints parser stats (memory, packets, performance). |
| `Logger` | Logging strategy (see above). |
| `PlaybackInterruptedError` | Raised when `Player.play()` is interrupted. Exposes `reason`. |
| [`DemoPacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js) | Enum of outer packet types (`DEM_PACKET`, `DEM_FULL_PACKET`, …). |
| [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) | Enum of inner message types (`NET_TICK`, `SVC_PACKET_ENTITIES`, …). |
| [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js) | Enum of string tables (`USER_INFO`, `INSTANCE_BASE_LINE`, …). |
| `EntityOperation` | `CREATE`, `UPDATE`, `LEAVE`, `DELETE`. |
| `InterceptorStage` | `DEMO_PACKET`, `MESSAGE_PACKET`, `ENTITY_PACKET`. |
| `PlayerState` | `IDLE`, `LOADED`, `PLAYING`, `SEEKING`, `DISPOSED`. |
| `DemoSource` | `REPLAY`, `HTTP_BROADCAST`. |
| `Protocol` | `HTTP`, `HTTPS`. |
| `DeferredPromise` | Utility promise with external `resolve`/`reject`. |

Key methods on `Parser`: `parse(reader, source?, objectMode?)`, `extract(reader, source?)`, `pause()`, `resume()`, `abort()`, `dispose()`, `getDemo()`, `getStats()`, `getIsStarted()`, `getIsPaused()`, `getIsFinished()`, `getIsDisposed()`, plus the interceptor registration API.

Key methods on `Player`: `load(reader, source?)`, `seekToTick(tick)`, `nextTick()`, `prevTick()`, `play(rate?)`, `pause()`, `stop()`, `dispose()`, `getDemo()`, `getCurrentTick()`, `getFirstTick()`, `getLastTick()`, `getStats()`, `state`, plus the interceptor registration API.

## Usage

All examples assume `registry` is a populated `SchemaRegistry`. When using a game-specific package (`deadem`, `@deademx/dota2`), the registry is built automatically inside the subclassed `Parser` and `Player` — there is nothing to wire up. When consuming `@deademx/engine` directly, you must supply both a `ProtoProvider` and a bootstrap routine that layers game-specific types on top of `Bootstrap.run(registry)`.

### Replay file

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/engine';

const parser = new Parser(registry);
const printer = new Printer(parser);
const readable = createReadStream(PATH_TO_DEMO_FILE);

await parser.parse(readable);
await parser.dispose();

printer.printStats();
```

### HTTP broadcast

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser } from '@deademx/engine';

const FROM_BEGINNING = false;
const MATCH_ID = 'MATCH_IDENTIFIER';

const gateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const agent = new BroadcastAgent(gateway, MATCH_ID);

const parser = new Parser(registry);

await parser.parse(agent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);
await parser.dispose();
```

### Data extraction

Use interceptors when data must be captured *during* parsing:

```js
import { InterceptorStage, Parser } from '@deademx/engine';

const parser = new Parser(registry);

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    console.log(messagePacket.type.code, messagePacket.data);
});

await parser.parse(readable);
```

Use post-parse queries when only the final state is needed:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntities();
```

### Playback and seeking

Inspect state at a specific tick:

```js
import { createReadStream } from 'node:fs';

import { Player } from '@deademx/engine';

const player = new Player(registry);
const readable = createReadStream(PATH_TO_DEMO_FILE);

await player.load(readable);
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();
const entities = demo.getEntities();

await player.dispose();
```

Continuous playback at 2× speed, paused after 3 seconds:

```js
import { PlaybackInterruptedError, Player } from '@deademx/engine';

const player = new Player(registry);

await player.load(readable);

const playback = player.play(2.0).catch((err) => {
    if (!(err instanceof PlaybackInterruptedError)) throw err;
});

setTimeout(() => player.pause(), 3000);

await playback;
await player.dispose();
```

## Performance

Parser throughput depends on the replay contents, the packet filters you apply, and how often you unpack entity state. The table below summarizes the impact of each choice:

| Scenario | Expected impact | Notes |
| --- | --- | --- |
| Parse all packet types | Highest coverage, higher CPU and memory cost | Best when you need complete replay state. |
| Filter [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) via `ParserConfiguration` | Lower parse cost | Useful for chat-only or event-focused extraction. |
| Exclude `SVC_PACKET_ENTITIES` | Skips entity decoding entirely | Entities are typically the most expensive packets. |
| Use `entityClasses` | Lower entity decode cost while keeping the rest of the replay intact | Useful when you only need a few classes such as player controllers or game rules proxies. |
| Call `entity.unpackFlattened()` frequently | Higher per-entity overhead | Prefer targeted reads over unpacking every entity. |
| Increase `parserThreads` (Parser only) | Higher throughput at the cost of memory | Not supported by `Player`. |

For concrete benchmarks, see the [`deadem` performance section](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md#performance) or the [`@deadem/dota2` performance section](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md#performance).

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.
