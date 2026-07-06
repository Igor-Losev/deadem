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

**@deademx/engine** is the shared, game-agnostic Source 2 parsing and replay playback engine that powers [`deadem`](https://github.com/Igor-Losev/deadem/tree/main/packages/deadem) (Deadlock), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/tree/main/packages/cs2) (Counter-Strike 2), and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/tree/main/packages/dota2) (Dota 2).

It provides the packet pipeline, mutable demo state, replay player, interceptor lifecycle, broadcast client, and configuration primitives. The engine itself carries no game-specific protobuf schemas or message types — using it directly requires a prepared `SchemaRegistry`. Ready-to-run packages are listed below.

| Package | Game | Links |
| --- | --- | --- |
| `deadem` | Deadlock | [npm](https://www.npmjs.com/package/deadem) · [docs](https://github.com/Igor-Losev/deadem/tree/main/packages/deadem) |
| `@deademx/cs2` | Counter-Strike 2 | [npm](https://www.npmjs.com/package/@deademx/cs2) · [docs](https://github.com/Igor-Losev/deadem/tree/main/packages/cs2) |
| `@deademx/dota2` | Dota 2 | [npm](https://www.npmjs.com/package/@deademx/dota2) · [docs](https://github.com/Igor-Losev/deadem/tree/main/packages/dota2) |

> [!NOTE]
> `@deademx/engine` is not runnable on its own. It depends on upstream proto files, decoders, and string table parsing instructions. A game package supplies all three.
>
> This document shows every example using `deadem` (Deadlock). The API is identical across games — only the import and entity class names change.

## Contents

- [Quick Start](#quick-start)<br/>
  Parse a replay, print stats.
- [How It Works](#how-it-works)<br/>
  Packet flow, parser lifecycle, interceptors overview.
- [Demo](#demo)<br/>
  Structure of Source 2 demo.
  - [Entities](#entities)<br/>
    Entity identity, decoded fields, query API.
  - [String Tables](#string-tables)<br/>
    Container, entries, subscription events.
- [Interceptors](#interceptors)<br/>
  Capturing data in flight.
  - [`InterceptorStage.DEMO_PACKET`](#interceptorstagedemo_packet)<br/>
    One call per outer demo packet.
  - [`InterceptorStage.MESSAGE_PACKET`](#interceptorstagemessage_packet)<br/>
    Inner message packets — string tables, entities, user messages.
  - [`InterceptorStage.ENTITY_PACKET`](#interceptorstageentity_packet)<br/>
    Per-entity mutation events — delta reads, operation table.
  - [Interceptor Flow](#interceptor-flow)<br/>
    Nesting diagram of all interceptor stages.
- [Player](#player)<br/>
  Replay — seeking, playback, state machine.
  - [Seeking](#seeking)<br/>
    Tick seeking, entity state access.
  - [State](#state)<br/>
    State transitions.
  - [Navigation](#navigation)<br/>
    Tick methods, seek cost.
  - [Playback](#playback)<br/>
    Continuous play, pause/stop, error handling.
- [Configuration & Tuning](#configuration--tuning)<br/>
  Packet filtering, break interval, logging.
  - [Filters](#filters)<br/>
    `entityClasses`, `messagePacketTypes` — the primary speed lever.
  - [Stream Tuning](#stream-tuning)<br/>
    `breakInterval` — macrotask scheduling for UI responsiveness.
  - [Logging](#logging)<br/>
    Verbosity strategies.
- [HTTP Broadcast](#http-broadcast)<br/>
  Live Source 2 broadcast parsing.
- [Performance](#performance)<br/>
  Speedup table and tuning advice.
  - [Tips](#tips)<br/>
    Optimization patterns.
- [License](#license)<br/>
  MIT.

## Quick Start

```bash
npm install deadem
```

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from 'deadem';

const parser = new Parser();
const readable = createReadStream('./match.dem');

await parser.parse(readable);

const printer = new Printer(parser);
printer.printStats();

await parser.dispose(); // cleanup state and resources
```

## How It Works

[`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js) reads a byte stream and processes it packet by packet, mutating internal state. Interceptors run before or after each packet. Once parsing ends, `Parser` holds the game state — `dispose()` releases it. [`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Player.js) works the same way but buffers the demo in memory, adding seeking and playback.

The engine provides raw parsed data — it does not compute statistics, interpret game state, or make analytical decisions.

## Demo

[`Demo`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) is the state that [`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js) and [`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Player.js) mutate as they read. Access with `parser.getDemo()` or `player.getDemo()`.

A demo file is a stream of outer packets, called [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js) in this project. Most carry protobuf-decoded data relevant to that packet type. Three outer packet types — [`DEM_PACKET`, `DEM_SIGNON_PACKET`, `DEM_FULL_PACKET`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js) — are different: they carry an array of inner packets, called [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js) in this project. Each represents a network message — entity deltas, string table operations, user messages — identified by its [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js).

[`MessagePacketType.SVC_PACKET_ENTITIES`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) carries packed entity deltas, sent every tick. Once unpacked, they become part of `Demo`. `Demo` also holds string tables.

### Entities

`Demo` provides access to current entity state.

| Method | Returns |
| --- | --- |
| `demo.getEntities()` | All live entities |
| `demo.getEntitiesByClassName(name)` | Entities filtered by class name |
| `demo.getEntity(index)` | Entity by index |
| `demo.getEntityByHandle(handle)`* | Entity by handle |
| `demo.getClasses()` | All registered entity classes |
| `demo.getClassByName(name)` | Entity [`Class`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Class.js) by name |

\* — entity fields like `m_hOwnerEntity` store handles pointing to other entities. `demo.getEntityByHandle(handle)` resolves references between entities.

Each entity is an instance of [`Entity`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js). Entity exposes methods for reading data:

| Method | Returns |
| --- | --- |
| `entity.getField(name)` | Value by flattened name. Dot notation accesses sub-fields, e.g. `'CBodyComponent.m_cellX'`. `undefined` if not present |
| `entity.hasField(name)` | Whether the named field is currently set |
| `entity.getFieldCount()` | Number of fields currently set |
| `entity.fieldEntries()` | Iterator of `[ name, value ]` pairs for present fields |
| `entity.fieldNames()` | Iterator of present field names |
| `entity.unpackFlattened()` | Plain object keyed by field name |

### String Tables

The engine registers common [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js)s:

| `StringTableType` | Content |
| --- | --- |
| `StringTableType.ANIM_ASSET_DATA` | Animation asset paths (.vnmgraph/.vnmskel). Values are unparsed binary |
| `StringTableType.ANIM_TASK_TYPES` | Key-only anim-task class names. Always co-occurs with `ANIM_ASSET_DATA` |
| `StringTableType.DECAL_PRE_CACHE` | Decal paths keyed by path. Absent in newer builds for all three games |
| `StringTableType.EFFECT_DISPATCH` | Key-only names. Fixed per-game set |
| `StringTableType.ENTITY_NAMES` | Key-only registry of named entities |
| `StringTableType.GENERIC_PRE_CACHE` | — |
| `StringTableType.INFO_PANEL` | — |
| `StringTableType.INSTANCE_BASE_LINE` | Entity class baselines, consumed internally for entity decoding |
| `StringTableType.LIGHT_STYLES` | — |
| `StringTableType.RESPONSE_KEYS` | — |
| `StringTableType.SCENES` | — |
| `StringTableType.SERVER_QUERY_INFO` | — |
| `StringTableType.USER_INFO` | Player name, Steam ID, userid — decoded `CMsgPlayerInfo` per slot |
| `StringTableType.V_GUI_SCREEN` | — |

> [!NOTE]
> `StringTableType.USER_INFO` slots hold values only while a player is connected. Players disconnect after the match ends — by the time `parse()` returns, most slots are empty.

Access tables through [`StringTableContainer`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableContainer.js):

| Method | Returns |
| --- | --- |
| `demo.stringTableContainer.getById(id)` | Table by id, or `null` |
| `demo.stringTableContainer.getByType(type)` | Table by its [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js), or `null` |
| `demo.stringTableContainer.getTables()` | All tables |

Table entries:

| Method | Returns |
| --- | --- |
| `table.getEntries()` | All entries |
| `table.getEntriesCount()` | Number of entries |
| `table.getEntryById(id)` | Entry by id, or `null` |

An entry is a [`StringTableEntry`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableEntry.js):

| Property | Returns |
| --- | --- |
| `entry.id` | Positional id within the table |
| `entry.key` | String key |
| `entry.value` | `null` for key-only entries. Otherwise a decoded value or the raw `Uint8Array` payload. |

`StringTableContainer` reports table changes through [`StringTableEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableEvent.js):

| Event | Fires when |
| --- | --- |
| `TABLE_CREATED` | A table is registered |
| `TABLE_UPDATED` | An existing table's entries change |
| `TABLE_REMOVED` | A table is removed |

Subscribe with `demo.stringTableContainer.subscribe(StringTableEvent.TABLE_UPDATED, callback)`, unsubscribe the same way. The callback receives `(StringTableContainer, StringTable, Array<StringTableEntry>|null)`.

## Interceptors

Interceptors capture data in flight — per packet, before or after it reaches `Demo`. [`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js) and [`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Player.js) expose `registerPreInterceptor(stage, callback)`, `registerPostInterceptor(stage, callback)`, `unregisterPreInterceptor(stage, callback)`, and `unregisterPostInterceptor(stage, callback)`. Unregistration uses reference equality — the same function instance must be passed. `PRE` fires before a stage's data reaches `Demo`; `POST` fires after.

There are three [`InterceptorStage`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/InterceptorStage.js) values:

| Stage | Hook signature |
| --- | --- |
| `DEMO_PACKET` | ([`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js)) => void |
| `MESSAGE_PACKET` | ([`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js)) => void |
| `ENTITY_PACKET` | ([`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), Array<[`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js)>) => void |

### `InterceptorStage.DEMO_PACKET`

One call per outer [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js):

```js
import { InterceptorStage, Parser } from 'deadem';

const parser = new Parser();

parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
    console.log(`Tick [ ${demoPacket.tick} ] | Type [ ${demoPacket.type.code} ]`);
});
```

### `InterceptorStage.MESSAGE_PACKET`

One call per inner [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js).

```js
import { MessagePacketType } from 'deadem';

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type !== MessagePacketType.NET_TICK) return;

    console.log(messagePacket.data);
});
```

`messagePacket.data` is protobuf-decoded. Two types carry further encoded data:

- `SVC_CREATE_STRING_TABLE` and `SVC_UPDATE_STRING_TABLE` — encoded entries, decoded internally. For per-entry changes, use `StringTableContainer.subscribe`.
- `SVC_PACKET_ENTITIES` — packed entity changes, decoded internally. For per-entity changes, use `InterceptorStage.ENTITY_PACKET`.

### `InterceptorStage.ENTITY_PACKET`

One call per `SVC_PACKET_ENTITIES`, with an array of [`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js) — one per entity:

```js
import { EntityOperation } from 'deadem';

parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (event.operation !== EntityOperation.UPDATE) continue;
        if (event.entity.class.name !== 'CCitadelPlayerPawn') continue; // Deadlock player pawn entity

        const [health] = event.getChanges(['m_iHealth']);

        if (health !== undefined) {
            console.log(`Tick [ ${demoPacket.tick} ] | Entity [ ${event.entity.class.name}|${event.entity.index} ] | Health [ ${health} ]`);
        }
    }
});
```

Each event exposes:

| Property | Returns |
| --- | --- |
| `event.operation` | [`EntityOperation`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/EntityOperation.js) — `CREATE`, `UPDATE`, `LEAVE`, or `DELETE` |
| `event.entity` | Affected [`Entity`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) |

`event.getChanges()` — object of all changed fields. `event.getChanges(names)` — array of values in the same order as `names`, `undefined` for fields not in the event.

| Operation | When | Batch |
|---|---|---|
| `CREATE` | Entity first appears | All initial fields |
| `UPDATE` | Entity fields changed | Changed fields only |
| `LEAVE` | Entity deactivated, slot reserved | Empty |
| `DELETE` | Entity permanently removed | Empty |

### Interceptor Flow

```text
PRE DEMO_PACKET
 └─ DEM_FILE_HEADER
POST DEMO_PACKET
...
PRE DEMO_PACKET
 └─ DEM_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ NET_TICK
     ├─ POST MESSAGE_PACKET
     ├─ ...
     ├─ PRE MESSAGE_PACKET
     │   └─ SVC_PACKET_ENTITIES
     │       ├─ PRE ENTITY_PACKET
     │       │   └─ events
     │       └─ POST ENTITY_PACKET
     ├─ POST MESSAGE_PACKET
     └─ ...
POST DEMO_PACKET
```

## Player

[`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Player.js) steps tick by tick, jumps to any tick, or plays back at a chosen rate. It wraps [`ParserEngine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/ParserEngine.js) — the same engine that powers [`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js).

`load()` buffers the entire file and indexes keyframes. Streaming and HTTP broadcast are not supported (yet) — seeking requires the entire file buffered.

### Seeking

```js
import { createReadStream } from 'node:fs';

import { Player } from 'deadem';

const player = new Player();

await player.load(createReadStream('./match.dem'));
await player.seekToTick(player.getLastTick());

const controllers = player.getDemo().getEntitiesByClassName('CCitadelPlayerController'); // Deadlock player controllers

for (const controller of controllers) {
    const name = controller.getField('m_iszPlayerName');
    const netWorth = controller.getField('m_iGoldNetWorth');

    console.log(`[ ${name} ] | m_iGoldNetWorth [ ${netWorth} ]`);
}

await player.dispose();
```

### State

`Player` follows a state machine:

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

A failed seek still returns to `LOADED`.

### Navigation

| Method | Returns |
| --- | --- |
| `player.getCurrentTick()` | Current tick |
| `player.getFirstTick()` | First tick in the demo |
| `player.getLastTick()` | Last tick in the demo |
| `player.nextTick()` | Advances one tick. `false` at the last tick |
| `player.prevTick()` | Moves back one tick. `false` at the first tick |
| `player.seekToTick(tick)` | Jumps to the given tick, or the nearest one before it |

`nextTick()` advances the open session — cheap. `seekToTick()` closes it and opens a new one from the nearest keyframe — expensive. `prevTick()` calls `seekToTick()` internally: the name is symmetric, the cost is not.

Every seek clears `Demo` internals — entities and tables from a previous tick are stale. The `Demo` instance remains the same, its contents are rebuilt.

### Playback

| Method | Returns |
| --- | --- |
| `player.play(rate = 1.0)` | Promise that resolves at the last tick |
| `player.pause()` | Rejects the `play()` promise. No-op if not playing |
| `player.stop()` | Rejects the `play()` promise, then seeks to the first tick. No-op if not playing |

`play()` also rejects if interrupted by `seekToTick()`, or by `dispose()`. Unlike `pause()` / `stop()`, calling `play()` while not `LOADED` throws — a no‑op otherwise. The rejection is a [`PlaybackInterruptedError`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/errors/PlaybackInterruptedError.js) with `.reason`: `'paused'`, `'stopped'`, or `'disposed'`.

```js
const playback = player.play(0.5); // half speed

setTimeout(() => player.pause(), 1000);

try {
    await playback;
} catch (error) {
    console.log(error.reason); // 'paused'
}
```

Interceptors work the same as on `Parser` (above) and stay registered across seeks.

## Configuration & Tuning

[`ParserConfiguration`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/ParserConfiguration.js) tunes entity decoding, packet filtering, and stream behavior.

### Filters

Filters are the primary lever for parser performance — reducing decoded data cuts both memory and time.

| Option | Type | Default | Filters |
| --- | --- | --- | --- |
| `entityClasses` | `Array<string>\|null` | `null` | Which entity classes get their fields decoded |
| `messagePacketTypes` | `Array<MessagePacketType>\|null` | `null` | Allowlist of message types to process |
| `messagePacketTypesExclude` | `Array<MessagePacketType>\|null` | `null` | Blocklist of message types to process |

Four [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) values are always processed — they drive internal state: `SVC_SERVER_INFO`, `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE`, `SVC_CLEAR_ALL_STRING_TABLES`.

```js
import { MessagePacketType, Parser, Player, ParserConfiguration } from 'deadem';

const configA = new ParserConfiguration({
    messagePacketTypesExclude: [MessagePacketType.SVC_PACKET_ENTITIES]
});

const configB = new ParserConfiguration({
    entityClasses: ['CCitadelPlayerPawn', 'CCitadelPlayerController']
});

new Parser(configA);
new Player(configB);
```

### Stream Tuning

`breakInterval` — every N `DemoPacket`s, the parser schedules and awaits a macrotask to avoid blocking. Lower values mean more breaks (responsive UI, slower parse); higher values mean fewer breaks (faster parse, blocked UI). Default is `1000`.

### Logging

[`Logger`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/core/Logger.js) controls verbosity. Accepted by `Parser` and `Player` constructors. Built-in strategies — `CONSOLE_TRACE`, `CONSOLE_DEBUG`, `CONSOLE_INFO` (default), `CONSOLE_WARN`, `NOOP`.

```js
import { Logger, Parser, ParserConfiguration } from 'deadem';

new Parser(ParserConfiguration.DEFAULT, Logger.CONSOLE_WARN);
```

## HTTP Broadcast

[`BroadcastAgent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/broadcast/BroadcastAgent.js) exposes a live Source 2 TV broadcast as a readable stream for `Parser`.

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser } from 'deadem';

const MATCH_ID = 'MATCH_IDENTIFIER';

const gateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const agent = new BroadcastAgent(gateway, MATCH_ID);

const parser = new Parser();

await parser.parse(agent.stream(), DemoSource.HTTP_BROADCAST);
```

`agent.stream(fromStart = false)` polls fragments from the relay and emits them as they arrive. `DemoSource.HTTP_BROADCAST` is required — `parse()` defaults to `DemoSource.REPLAY`.

`BroadcastAgent` defaults to `Logger.CONSOLE_DEBUG` — louder than `Parser`'s and `Player`'s `CONSOLE_INFO` default. A logger can be passed explicitly to quiet it.

## Performance

Entity-packet decoding (`SVC_PACKET_ENTITIES`) accounts for most of the parser's work — everything else combined is under ~20%. Three configurations cover typical use cases:

| # | Configuration | Speedup |
| --- | --- | --- |
| 1 | No filters | 1× (baseline) |
| 2 | Exclude `SVC_PACKET_ENTITIES` entirely | ~4–6× |
| 3 | `entityClasses` allowlist | ~1–5× |

For concrete numbers see the [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md#performance), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md#performance), or [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md#performance) performance sections.

### Tips

- Filter what gets decoded — the biggest performance gain. Only enable the message types and entity classes the code needs.

- `breakInterval` default (`1000`) is tuned for Node.js. In a browser, lower it to keep the UI responsive — `100` is used in Deadem Explorer. Experiment to find the balance for the target environment.

- Mind the call frequency. A 500 MB Deadlock demo may contain ~150k `InterceptorStage.DEMO_PACKET` and ~3M `InterceptorStage.MESSAGE_PACKET` calls — one interceptor invocation each. Heavy work in the `InterceptorStage.MESSAGE_PACKET` interceptor compounds fast and can tank performance. The same holds for CS2 and Dota 2 demos.

- Use `InterceptorStage.ENTITY_PACKET` only when per-entity diffs between ticks are needed. To simply read current state — player positions, health, etc. — use `Demo` from an `InterceptorStage.DEMO_PACKET` interceptor instead.

- Throttle per-tick logic when frame-level precision isn't required. A UI renderer rarely needs health changes every tick — sampling once per second is usually enough. Depending on server tick rate, that's every 64 ticks (Deadlock), every 30 ticks (Dota 2), or similar for CS2.

- Read as much as needed. Prefer point reads via `getField('name')` over `unpackFlattened` or iterators. A 500 MB Deadlock demo may produce ~10M [`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js)s carrying ~100M individual field updates — entity state stays in TypedArrays internally, keeping memory compact. Values materialize into JS objects on read. See [`Entity.getField`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) JSDoc for detailed overhead.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
