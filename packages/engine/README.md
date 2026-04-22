<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deadem/engine
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deadem/engine" alt=""><img src="https://img.shields.io/npm/v/%40deadem%2Fengine" /></a>

**@deadem/engine** is the shared parsing and playback engine used by the `deadem` and `@deadem/dota2` packages.

It provides the common Source 2 parsing pipeline, mutable demo state, replay player, interceptor lifecycle, broadcast support, and core configuration primitives.

This package is intentionally low-level: `Parser` and `Player` require a prepared `SchemaRegistry`. If you want a ready-to-run package, use [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md) or [`@deadem/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md).

## Implementations

- [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md) for Deadlock-specific packet types, examples, and compatibility notes
- [`@deadem/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md) for Dota 2-specific packet types and examples

## Installation

### Node.js

```shell
npm install @deadem/engine --save
```

```js
import { Parser, Player, SchemaRegistry } from '@deadem/engine';
```

### Browser

Use one of the game packages if you need a ready-to-run implementation with game-specific schemas and message types.

## Bootstrapping

`@deadem/engine` does not ship a game schema. Consumers are expected to create and populate a `SchemaRegistry` before constructing `Parser` or `Player`.

Typical flow:

1. Load protobuf schema JSON for your game
2. Create a `ProtoProvider`
3. Create a `SchemaRegistry`
4. Run the engine bootstrap, then your game bootstrap
5. Pass the registry into `Parser` or `Player`

```js
import {
    Parser,
    Player,
    SchemaRegistry
} from '@deadem/engine';
import EngineBootstrap from '@deadem/engine/src/bootstrap/Bootstrap.js';
import ProtoProvider from '@deadem/engine/src/providers/ProtoProvider.js';

const protoProvider = new ProtoProvider(PROTO_JSON);
const registry = new SchemaRegistry(protoProvider);

EngineBootstrap.run(registry);
GameBootstrap.run(registry);

const parser = new Parser(registry);
const player = new Player(registry);
```

## Overview

### Understanding Demo

The demo file consists of a sequential stream of outer packets, referred to in this project as `DemoPacket`.
Each packet represents a type defined in `DemoPacketType`.

Most `DemoPacket` types, once parsed, become plain JavaScript objects containing structured data. Some packet types, such as `DEM_PACKET`, `DEM_SIGNON_PACKET`, and `DEM_FULL_PACKET`, encapsulate an array of inner packets, referred to in this project as `MessagePacket`.

Similarly, most `MessagePacket` types also parse into regular data objects. There are two notable exceptions that require additional parsing:

1. **Entities**: `MessagePacketType.SVC_PACKET_ENTITIES` contains granular or full updates to existing entities.
2. **String Tables**: `MessagePacketType.SVC_CREATE_STRING_TABLE`, `MessagePacketType.SVC_UPDATE_STRING_TABLE`, and `MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES` update existing string tables.

> Warning
>
> Demo files contain only the minimal data required for visual playback. Not all game state information is preserved or available, and the parser may skip packets it cannot decode.
>
> You can retrieve detailed statistics about parsed and skipped packets by calling `parser.getStats()`.

The `Demo` object is updated tick by tick and exposes query methods for the current game state:

- `demo.getEntities()` for all live entities
- `demo.getEntitiesByClassName(className)` for class-filtered entities
- `demo.getEntity(index)` for a single entity by index
- `demo.getClasses()` for registered entity classes

### Understanding Parser

The parser accepts a readable stream and incrementally parses individual packets from it.
It maintains an internal, mutable `Demo` instance representing the current state of the game.

```js
const demo = parser.getDemo();
```

The parser overwrites existing state as ticks advance and does not store past snapshots.

The parser also supports pausing and resuming mid-stream:

```js
parser.pause();
parser.resume();
```

Once parsing is complete, call `dispose()` to release internal resources:

```js
await parser.dispose();
```

### Understanding Player

`Player` is a higher-level class built on top of the parser engine for replay playback.
Unlike `Parser`, which processes a stream sequentially and discards past state, `Player` buffers the entire demo on `load()` and builds an internal packet index, enabling seek-to-tick in both directions.

```js
const player = new Player();

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
 ├── pause() / end of replay → LOADED
 └── dispose()     → DISPOSED

SEEKING
 ├── (completes)   → LOADED
 └── dispose()     → DISPOSED
```

| State | Description |
| --- | --- |
| `IDLE` | Initial state. `load()` or `dispose()` can be called. |
| `LOADED` | Demo is buffered and indexed. Ready for all operations. |
| `PLAYING` | Continuous playback is running. |
| `SEEKING` | A `seekToTick()` call is in progress. |
| `DISPOSED` | Resources released. The player cannot be used further. |

The current state is exposed via `player.state`.

The player exposes the same interceptor API as the parser: `registerPreInterceptor`, `registerPostInterceptor`, `unregisterPreInterceptor`, and `unregisterPostInterceptor`.

> Note
>
> `Player` does not support `parserThreads > 0`.

### Understanding Interceptors

Interceptors are user-defined hooks that run before or after specific parsing stages.
They allow you to inspect and extract data while parsing.

Currently, there are three supported stages:

- `InterceptorStage.DEMO_PACKET`
- `InterceptorStage.MESSAGE_PACKET`
- `InterceptorStage.ENTITY_PACKET`

Register hooks with:

- `parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, hookFn)`
- `parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, hookFn)`

The parsing timeline looks like this:

```text
...
PRE DEMO_PACKET
 └─ DEM_FILE_HEADER
POST DEMO_PACKET
...
PRE DEMO_PACKET
 └─ DEM_SEND_TABLES
POST DEMO_PACKET
...
PRE DEMO_PACKET
 └─ DEM_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ NET_TICK
     └─ POST MESSAGE_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ SVC_ENTITIES
     │       ├─ PRE ENTITY_PACKET
     │       │   └─ ENTITY_1
     │       └─ POST ENTITY_PACKET
     │       ├─ PRE ENTITY_PACKET
     │       │   └─ ENTITY_2
     │       └─ POST ENTITY_PACKET
     └─ POST MESSAGE_PACKET
POST DEMO_PACKET
...
```

Each interceptor receives different arguments depending on `InterceptorStage`:

| Interceptor Stage | Hook Type | Hook Signature |
| --- | --- | --- |
| `DEMO_PACKET` | `pre` / `post` | `(demoPacket) => void` |
| `MESSAGE_PACKET` | `pre` / `post` | `(demoPacket, messagePacket) => void` |
| `ENTITY_PACKET` | `pre` / `post` | `(demoPacket, messagePacket, events) => void` |

> Important
>
> Interceptor hooks are not blocking. The parser does not `await` async callbacks, so use synchronous interceptors when data must be captured before parsing continues.

## Configuration

### Parsing

Below is a list of options accepted by `ParserConfiguration`:

| Option | Description | Type | Default |
| --- | --- | --- | --- |
| `breakInterval` | How often, in packets, to yield to the event loop. Lower values improve responsiveness but may reduce throughput. | `number` | `1000` |
| `messagePacketTypes` | Allowlist of `MessagePacketType` values to process. Mutually exclusive with `messagePacketTypesExclude`. | `Array<MessagePacketType> \| null` | `null` |
| `messagePacketTypesExclude` | Blocklist of `MessagePacketType` values to skip. Mutually exclusive with `messagePacketTypes`. | `Array<MessagePacketType> \| null` | `null` |
| `parserThreads` | Number of additional worker threads used by the parser. | `number` | `0` |

Critical packet types are always processed even when filtered, because the engine requires them to maintain internal state:

- `SVC_SERVER_INFO`
- `SVC_CREATE_STRING_TABLE`
- `SVC_UPDATE_STRING_TABLE`
- `SVC_CLEAR_ALL_STRING_TABLES`

Example: skip entity packets when entity data is not needed:

```js
import { MessagePacketType, Parser, ParserConfiguration } from '@deadem/engine';

const parser = new Parser(registry, new ParserConfiguration({
    messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
}));
```

### Logging

The library provides a `Logger` class with predefined logging strategies:

- `Logger.CONSOLE_WARN` for warnings and errors
- `Logger.NOOP` to disable logging

```js
import { Logger, Parser, ParserConfiguration } from '@deadem/engine';

const configuration = new ParserConfiguration({ parserThreads: 2 });

const parser = new Parser(registry, configuration, Logger.CONSOLE_WARN);
```

## Usage

### Demo File

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deadem/engine';

const parser = new Parser(registry);
const printer = new Printer(parser);
const readable = createReadStream(PATH_TO_DEMO_FILE);

await parser.parse(readable);
await parser.dispose();

printer.printStats();
```

### Broadcast Stream

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser, Printer } from '@deadem/engine';

const FROM_BEGINNING = false;
const MATCH_ID = 'MATCH_IDENTIFIER';

const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID);

const parser = new Parser(registry);
const printer = new Printer(parser);

await parser.parse(broadcastAgent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);
await parser.dispose();

printer.printStats();
```

### Data Extraction

Use interceptors when data must be captured during parsing:

```js
import { InterceptorStage, Parser } from '@deadem/engine';

const parser = new Parser(registry);

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    console.log(messagePacket.type, messagePacket.data);
});

await parser.parse(readable);
```

Use post-parse queries when only the final state is needed:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntities();
```

### Player

Inspect game state at a specific tick:

```js
import { createReadStream } from 'node:fs';

import { InterceptorStage, Player } from '@deadem/engine';

const player = new Player(registry);

player.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    console.log(events.length);
});

const readable = createReadStream(PATH_TO_DEMO_FILE);

await player.load(readable);

console.log(`Ticks: [ ${player.getFirstTick()} ] - [ ${player.getLastTick()} ]`);

await player.seekToTick(player.getLastTick());

const demo = player.getDemo();
const entities = demo.getEntities();

await player.dispose();
```

Continuous playback:

```js
import { createReadStream } from 'node:fs';

import { PlaybackInterruptedError, Player } from '@deadem/engine';

const player = new Player(registry);
const readable = createReadStream(PATH_TO_DEMO_FILE);

await player.load(readable);

const playback = player.play(2.0).catch((err) => {
    if (!(err instanceof PlaybackInterruptedError)) {
        throw err;
    }
});

setTimeout(() => player.pause(), 3000);

await playback;

await player.dispose();
```

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.
