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

**@deademx/engine** is the shared Source 2 core behind [`@deademx/deadlock`](https://www.npmjs.com/package/@deademx/deadlock) (Deadlock), [`@deademx/cs2`](https://www.npmjs.com/package/@deademx/cs2) (Counter-Strike 2) and [`@deademx/dota2`](https://www.npmjs.com/package/@deademx/dota2) (Dota 2).

Source 2 games share the same demo format, while each game defines its own protobuf messages and decoder rules. Because of this split, `@deademx/engine` does not run on its own. The engine provides the shared toolkit: `Parser`, `Player` and `Cutter`. Each game package adds its `.proto` definitions and game-specific configuration on top.

> [!NOTE]
> All examples use `@deademx/deadlock`. Unless noted otherwise, the API is identical across all three game packages.

## Contents

- [Quick Start](#quick-start)<br/>
  Reading player names and kills from a demo.
- [How It Works](#how-it-works)<br/>
  Ticks, deltas, packet layers and snapshots.
- [Data Model](#data-model)<br/>
  Stateful data in `Demo`, stateless data and deltas.
- [Interceptors](#interceptors)<br/>
  Callbacks before and after each packet.
- [HTTP Broadcast](#http-broadcast)<br/>
  Parsing a live match over HTTP.
- [Player](#player)<br/>
  Seeking, stepping and real-time playback.
- [Cutter](#cutter)<br/>
  Extracting playable clips from a demo.
- [Performance](#performance)<br/>
  Filters, stream tuning, speedups and tips.
- [Types](#types)<br/>
  TypeScript declarations and `is()`.
- [Vocabulary](#vocabulary)<br/>
  Core terms and their source files.
- [Useful Links](#useful-links)<br/>
  Valve documentation on networking and demos.
- [License](#license)<br/>
  MIT.

## Quick Start

Install a game package rather than `@deademx/engine` directly:

```bash
npm install @deademx/deadlock
```

Pass a readable stream of a `.dem` file to `Parser`, wait for `parse()` to finish, and read the final match state from `Demo`:

```js
import { createReadStream } from 'node:fs';

import { Parser } from '@deademx/deadlock';

const parser = new Parser();

await parser.parse(createReadStream('./match.dem'));

const demo = parser.getDemo();

for (const controller of demo.getEntitiesByClassName('CCitadelPlayerController')) {
    console.log(controller.getField('m_iszPlayerName'), controller.getField('m_PlayerDataGlobal.m_iPlayerKills'));
}

await parser.dispose(); // release state and resources
```

## How It Works

A demo (`.dem`) is a recording of a match. It stores the sequence of frames and network messages that the game client replays. The engine reads this byte stream, unpacks its packets and decompresses their payloads.

The structure of a demo follows from how the server simulates a match: in discrete time steps called ticks. Deadlock and Counter-Strike 2 typically run at 64 ticks per second (one every 15.625 ms), while Dota 2 runs at 30. Sending or saving the full world state at every tick is inefficient. Instead, the server sends deltas: only what changed since the previous tick. A demo records this delta stream. Therefore, the world state at any tick is the result of applying all deltas up to that point.

A demo stream has two layers of packets. The outer layer is the demo container itself: frames stamped with a tick, called demo packets (`DemoPacket`). Inside a tick, the server sends many messages at once, such as entity updates, chat and sounds. These travel as inner message packets (`MessagePacket`). There are 19 types of demo packets, while each game package supports roughly 70 to 200 types of message packets. Three demo packet types (`DEM_SIGNON_PACKET`, `DEM_PACKET` and `DEM_FULL_PACKET`) carry these inner messages.

```text
.dem (simplified)
 ├─ tick -1                                  match setup, handled internally
 │   ├─ DEM_FILE_HEADER
 │   ├─ DEM_SIGNON_PACKET ×N ── MessagePacket, …
 │   ├─ DEM_SEND_TABLES
 │   ├─ DEM_CLASS_INFO
 │   └─ DEM_STRING_TABLES
 ├─ DEM_PACKET       ── MessagePacket, …     first tick
 ├─ DEM_FULL_PACKET  ── MessagePacket, …     snapshot at the first tick, then about once a minute
 ├─ DEM_PACKET       ── MessagePacket, …     next recorded tick
 ├─ …
 ├─ DEM_STOP                                 last tick
 └─ DEM_FILE_INFO                            last tick
```

Sequential reading works well for a single pass from start to end. For random access, however, it is too slow. Jumping to the middle of a match would require replaying every delta from the first half. To avoid this, the format embeds a full snapshot (`DEM_FULL_PACKET`) roughly once every 60 seconds. A snapshot stores the full state of entities and string tables. Instead of replaying from the beginning of the file, a seek can start from the nearest earlier snapshot. The same snapshots also allow cutting a standalone clip from the middle of a match.

The engine provides three classes built around these properties:

- `Parser` reads a demo once from start to end, as fast as possible.
- `Player` buffers the demo, indexes its snapshots, and supports seeking to any tick and real-time playback.
- `Cutter` indexes the snapshots in one pass, then copies a tick window into a new standalone `.dem` file without decoding game state.

`Parser` and `Player` share the same [interceptor](#interceptors) API and build the same `Demo` state. `Cutter` works at the packet level and does not use interceptors.

## Data Model

Source 2 demos organize match data into four kinds:

| Kind | Examples | Where to read |
| --- | --- | --- |
| Entities | Heroes, weapons, creeps, health, position, kills, gold | `Demo` (state) or [interceptors](#interceptors) (diffs) |
| String tables | Connected players, active buffs, lookup strings | `Demo` (state) or [interceptors](#interceptors) (diffs) |
| User commands | Pressed buttons, view angles, movement | `Demo` (state) or [interceptors](#interceptors) (diffs) |
| Stateless data | Damage, kill feed, chat, file header | [interceptors](#interceptors) only |

Persistent match state (entities, string tables and user commands) is updated by deltas as packets arrive. `Parser` and `Player` maintain this state in a `Demo` object, returned by `parser.getDemo()` and `player.getDemo()`.

The engine updates the same `Demo` object in place as packets arrive. After `parse()`, it holds the end of the demo. To read an earlier tick, inspect `Demo` inside an [interceptor](#interceptors) or seek with [`Player`](#player).

> [!NOTE]
> Class names, field names and message types come directly from the game engine and differ per game. See the `Where to Find` table in [`@deademx/deadlock`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadlock/README.md#where-to-find), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md#where-to-find) or [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md#where-to-find), or inspect a replay in [Deadem Explorer](https://deadem.com).

### Entities

An entity is a game object, such as a hero, a weapon, a creep or an ability, with a class and named fields.

In Deadlock, a player is two entities. The controller (`CCitadelPlayerController`) holds match data such as name and net worth. The pawn (`CCitadelPlayerPawn`) holds the hero's position and health. Handle fields (usually `m_h*`) link entities, and `demo.getEntityByHandle()` resolves them:

```js
for (const pawn of demo.getEntitiesByClassName('CCitadelPlayerPawn')) {
    const controller = demo.getEntityByHandle(pawn.getField('m_hController'));

    if (controller === null) continue;

    console.log(controller.getField('m_iszPlayerName'), pawn.getField('m_iHealth'));
}
```

### String Tables

A string table is an indexed container of entries, each with a text string and optional binary data. Instead of repeating strings in every packet, the engine stores them once in a table and references them by index. For example, `userinfo` stores player names, and `ActiveModifiers` stores active buffs and debuffs.

`demo.stringTableContainer.getByType()` returns a table by its [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js):

```js
for (const table of demo.stringTableContainer.getTables()) {
    console.log(table.type.name, table.getEntriesCount());
}

const userInfo = demo.stringTableContainer.getByType(StringTableType.USER_INFO);

for (const entry of userInfo.getEntries()) {
    console.log(entry.id, entry.value?.name);
}
```

> [!NOTE]
> `USER_INFO` keeps an entry only while its player is connected. After `parse()` finishes, most players have already disconnected, so many entries are empty.

### User Commands

A user command is the input of one player at a tick: pressed buttons, view angles and movement. `demo.getUserCommands()` returns the latest command for each player slot. Player slot `N` corresponds to controller entity `N + 1`:

```js
for (const command of demo.getUserCommands()) {
    const controller = demo.getEntity(command.slot + 1);

    if (controller === null) continue;

    console.log(controller.getField('m_iszPlayerName'), command.state.base.viewangles);
}
```

> [!NOTE]
> Dota 2 demos do not contain user commands. Player actions arrive as message packets instead.

### Stateless Data and Deltas

Transient messages (damage, kills, chat) and packet metadata (`DEM_FILE_HEADER`) are not part of world state, so `Demo` does not store them. `Demo` also keeps only the current state, not per-tick diffs. Both are available only through [interceptors](#interceptors).

## Interceptors

An interceptor is a callback for one `InterceptorStage`. The engine calls it before (`PRE`) or after (`POST`) applying a packet to `Demo`. As a result, `PRE` sees the previous state and `POST` sees the updated state.

`Parser` and `Player` expose the same four registration methods:

- `registerPreInterceptor(stage, callback)` and `registerPostInterceptor(stage, callback)` attach a callback.
- `unregisterPreInterceptor(stage, callback)` and `unregisterPostInterceptor(stage, callback)` remove it.

Interceptors are synchronous. Returned promises are not awaited.

| Stage | Hook signature |
| --- | --- |
| `DEMO_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js)) => void |
| `MESSAGE_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js)) => void |
| `ENTITY_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), events: Array<[`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js)>) => void |
| `STRING_TABLE` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js) \| null, events: Array<[`StringTableMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableMutationEvent.js)>) => void |
| `USER_COMMAND` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), events: Array<[`UserCommandEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommandEvent.js)>) => void |

### `InterceptorStage.DEMO_PACKET`

Runs once for every demo packet. In the `POST` phase, every message inside that packet has already been applied. This makes `DEMO_PACKET` the right stage for sampling `Demo` at a specific tick.

The example below prints every player's net worth 10 minutes into the demo and then unregisters itself:

```js
import { createReadStream } from 'node:fs';

import { InterceptorStage, Parser } from '@deademx/deadlock';

const TICK = 10 * 60 * 64; // 10 minutes at 64 ticks per second

const parser = new Parser();

const interceptor = (demoPacket) => {
    if (demoPacket.tick < TICK) return;

    for (const controller of parser.getDemo().getEntitiesByClassName('CCitadelPlayerController')) {
        if (controller.getField('m_iTeamNum') < 2) continue; // spectators and SourceTV

        console.log(controller.getField('m_iszPlayerName'), controller.getField('m_PlayerDataGlobal.m_iGoldNetWorth'));
    }

    parser.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);
};

parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);

await parser.parse(createReadStream('./match.dem'));
```

### `InterceptorStage.MESSAGE_PACKET`

Runs once for every inner message packet. This stage handles stateless messages such as chat, damage and kills. Use `messagePacket.is()` to match a `MessagePacketType`:

```js
import { MessagePacketType } from '@deademx/deadlock';

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (!messagePacket.is(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE)) return;

    console.log(`Tick [ ${demoPacket.tick} ] | Slot [ ${messagePacket.data.playerSlot} ] | ${messagePacket.data.text}`);
});
```

### `InterceptorStage.ENTITY_PACKET`

Runs once per `SVC_PACKET_ENTITIES` message, with an [`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js) for each changed entity. Unlike reading `Demo`, it provides field diffs directly without scanning all entities:

```js
import { EntityOperation } from '@deademx/deadlock';

parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (event.operation !== EntityOperation.UPDATE) continue;
        if (event.entity.class.name !== 'CCitadelPlayerPawn') continue;

        const [ health ] = event.getChanges([ 'm_iHealth' ]);

        if (health !== undefined) {
            console.log(`Tick [ ${demoPacket.tick} ] | Entity [ ${event.entity.class.name}|${event.entity.index} ] | Health [ ${health} ]`);
        }
    }
});
```

| `event.operation` | When | `event.getChanges()` |
| --- | --- | --- |
| `CREATE` | The entity appears | All initial fields |
| `UPDATE` | Fields change | Changed fields |
| `LEAVE` | The server stops sending updates for the entity. It stays in `Demo` with `entity.active` set to `false` | Empty |
| `DELETE` | The entity is removed from `Demo` | Empty |

### `InterceptorStage.STRING_TABLE`

Runs whenever a string table is created, updated or cleared, with a [`StringTableMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableMutationEvent.js) for each affected table. Changes arrive in `DEM_STRING_TABLES` (where `messagePacket` is `null`) or in `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE` and `SVC_CLEAR_ALL_STRING_TABLES`.

The example below uses `PRE` so the table still holds the previous entry when comparing before and after:

```js
import { StringTableOperation, StringTableType } from '@deademx/deadlock';

parser.registerPreInterceptor(InterceptorStage.STRING_TABLE, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (!event.table.is(StringTableType.USER_INFO) || event.operation !== StringTableOperation.UPDATE) continue;

        for (const entry of event.entries) {
            const before = event.table.getEntryById(entry.id)?.value ?? null;
            const after = entry.value;

            if (before === null && after !== null) {
                console.log(`Tick [ ${demoPacket.tick} ] | Connected [ ${after.name} ]`);
            }

            if (before !== null && after === null) {
                console.log(`Tick [ ${demoPacket.tick} ] | Disconnected [ ${before.name} ]`);
            }
        }
    }
});
```

| `event.operation` | When | `event.entries` |
| --- | --- | --- |
| `CREATE` | A table is created or replaced | All entries |
| `UPDATE` | Entries change | Changed entries |
| `REMOVE` | `SVC_CLEAR_ALL_STRING_TABLES` removes the table | Empty |

### `InterceptorStage.USER_COMMAND`

Runs once per `SVC_USER_COMMANDS` or `SVC_USER_COMMAND_KEYFRAME` message, with a [`UserCommandEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommandEvent.js) for every command. `event.userCommand` holds the updated command, and `event.getChanges()` returns the diff in the shape of `state`.

```js
parser.registerPostInterceptor(InterceptorStage.USER_COMMAND, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        const { inShop } = event.getChanges(); // Deadlock: true while the shop is open

        if (inShop === true) {
            console.log(`Tick [ ${demoPacket.tick} ] | Slot [ ${event.userCommand.slot} ] | Shop opened`);
        }
    }
});
```

> [!NOTE]
> `USER_COMMAND` is `POST`-only. Registering it with `PRE`, or in `@deademx/dota2`, throws an error.

### Interceptor Flow

Outer demo packets wrap inner message packets, which wrap the state events they trigger:

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
     ├─ PRE MESSAGE_PACKET
     │   └─ SVC_UPDATE_STRING_TABLE
     │       ├─ PRE STRING_TABLE
     │       │   └─ events
     │       └─ POST STRING_TABLE
     ├─ POST MESSAGE_PACKET
     ├─ PRE MESSAGE_PACKET
     │   └─ SVC_USER_COMMANDS
     │       └─ POST USER_COMMAND
     ├─ POST MESSAGE_PACKET
     └─ ...
POST DEMO_PACKET
```

## HTTP Broadcast

HTTP broadcast delivers a live match over HTTP in fragments. The engine provides two classes for it:

- `BroadcastGateway` fetches fragments from a broadcast server.
- `BroadcastAgent` follows a match, downloads its fragments and turns them into a stream. After 30 seconds without a new fragment, the agent stops.

The broadcast format differs from a `.dem` file, so `Parser` requires `DemoSource.HTTP_BROADCAST`. Only `Parser` supports HTTP broadcasts.

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser } from '@deademx/deadlock';

const MATCH_ID = 'MATCH_IDENTIFIER_AND_SALT';

const gateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const agent = new BroadcastAgent(gateway, MATCH_ID);

const parser = new Parser();

await parser.parse(agent.stream(), DemoSource.HTTP_BROADCAST);
```

By default, `agent.stream()` joins near live, four fragments behind `/sync`. Calling `agent.stream(true)` starts from the first fragment instead.

## Player

Random access requires an index of all packets and snapshots upfront. `load()` reads the entire demo into memory and builds this index. Once loaded, `Player` supports seeking to any tick, stepping tick by tick and playing back at real-time speed or another rate.

### Seeking

`seekToTick(tick)` restores the nearest earlier snapshot and applies deltas up to `tick`. Seek time grows with distance from that snapshot.

```js
import { createReadStream } from 'node:fs';

import { Player } from '@deademx/deadlock';

const player = new Player();

await player.load(createReadStream('./match.dem'));
await player.seekToTick(player.getLastTick());

const controllers = player.getDemo().getEntitiesByClassName('CCitadelPlayerController');

for (const controller of controllers) {
    const name = controller.getField('m_iszPlayerName');
    const netWorth = controller.getField('m_PlayerDataGlobal.m_iGoldNetWorth');

    console.log(`[ ${name} ] | m_iGoldNetWorth [ ${netWorth} ]`);
}

await player.dispose();
```

### Navigation

Two methods move one tick at a time:

- `nextTick()` is synchronous and cheap because it applies one forward delta. At the last tick, it returns `false`.
- `prevTick()` is asynchronous and costs as much as a seek. Deltas only move state forward, so stepping back replays from the nearest earlier snapshot. At the first tick, it returns `false`.

```js
await player.seekToTick(10 * 60 * 64); // 10 minutes into the demo at 64 ticks per second

for (let i = 0; i < 10 && player.nextTick(); i++) { // 10 ticks forward
    console.log(`Tick [ ${player.getCurrentTick()} ]`);
}
```

### Playback

`play(rate)` plays the demo in real time, with `rate` multiplying playback speed (default `1.0`). The returned promise:

- Resolves when playback reaches the last tick.
- Rejects with `PlaybackInterruptedError` (`reason: 'paused'`) after `pause()` or `seekToTick()`.
- Rejects with `PlaybackInterruptedError` (`reason: 'stopped'`) after `stop()`.
- Rejects with `PlaybackInterruptedError` (`reason: 'disposed'`) after `dispose()`.
- Rejects with the original error if packet processing fails.

```js
const playback = player.play(0.5); // half speed

setTimeout(() => player.pause(), 1000);

try {
    await playback;
} catch (error) {
    console.log(error.reason); // 'paused'
}
```

### State

`Player` follows a state machine:

```text
IDLE
 ├── load()                 → LOADED
 └── dispose()              → DISPOSED

LOADED
 ├── play()                 → PLAYING
 ├── seekToTick()           → SEEKING → LOADED
 └── dispose()              → DISPOSED

PLAYING
 ├── pause() / stop() / end → LOADED
 ├── seekToTick()           → SEEKING → LOADED
 └── dispose()              → DISPOSED

SEEKING
 ├── (completes)            → LOADED
 └── dispose()              → DISPOSED
```

A failed seek still returns to `LOADED`.

## Cutter

> [!WARNING]
> `Cutter` is experimental and exempt from the project's semantic versioning. Its API and behavior may change, break or be removed in future releases.

`Cutter` extracts a tick window from a full demo into a standalone `.dem` file, aiming for proper playback in game clients. It works in two streaming passes:

1. `index(reader)` scans the demo once to record packet types, ticks, snapshots and string tables.
2. `cut(reader, from, to, commands)` reads the demo a second time and returns a `Uint8Array` for the `[from, to]` window.

`Cutter` can cut multiple windows sequentially or in parallel.

```js
import { createReadStream, writeFileSync } from 'node:fs';

import { ConsoleCommandType, Cutter } from '@deademx/deadlock';

const cutter = new Cutter();

await cutter.index(createReadStream('./match.dem'));

const clip = await cutter.cut(createReadStream('./match.dem'), 154494, 157054, [
    ConsoleCommandType.SPEC_PLAYER.create(4)
]);

writeFileSync('./clip.dem', clip);
```

### Console Commands

The optional fourth argument to `cut()` accepts console commands inserted at the start of the clip. Each game package provides commands on `ConsoleCommandType` for setting the spectator camera, documented in [`@deademx/deadlock`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadlock/README.md), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md).

## Performance

Entity decoding (`SVC_PACKET_ENTITIES`) accounts for most of the CPU and memory cost. `SVC_USER_COMMANDS` is a distant second. Everything else combined is minor.

Each class accepts a configuration object in its constructor (or uses its `DEFAULT` instance):

- `Parser` takes `ParserConfiguration` (filters and stream tuning).
- `Player` takes `PlayerConfiguration` (filters and stream tuning).
- `Cutter` takes `CutterConfiguration` (stream tuning only).

### Filters

Filtering out unneeded messages and entity classes is the primary way to speed up `Parser` and `Player` and reduce memory usage.

| Option | Type | Default | Filters |
| --- | --- | --- | --- |
| `entityClasses` | `Array<string>\|null` | `null` | Entity classes whose fields are decoded |
| `messagePacketTypes` | `Array<MessagePacketType>\|null` | `null` | Allowlist of message types |
| `messagePacketTypesExclude` | `Array<MessagePacketType>\|null` | `null` | Blocklist of message types |

Four message types always pass the filter because the engine requires them for decoding: `SVC_SERVER_INFO`, `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE` and `SVC_CLEAR_ALL_STRING_TABLES`.

```js
import { MessagePacketType, Parser, ParserConfiguration, Player, PlayerConfiguration } from '@deademx/deadlock';

// Skips all entities; everything else is decoded.
const parserConfiguration = new ParserConfiguration({
    messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
});

// Decodes only entities, and only the fields of player pawns and controllers.
const playerConfiguration = new PlayerConfiguration({
    messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ],
    entityClasses: [ 'CCitadelPlayerPawn', 'CCitadelPlayerController' ]
});

new Parser(parserConfiguration);
new Player(playerConfiguration);
```

The table below shows parse speed relative to `ParserConfiguration.DEFAULT`:

| Configuration | Deadlock | Counter-Strike 2 | Dota 2 |
| --- | --- | --- | --- |
| Everything, `ParserConfiguration.DEFAULT` | 1× | 1× | 1× |
| One entity class: `SVC_PACKET_ENTITIES` + `entityClasses` with the player controller | 3.7× | 2.8× | 2.3× |
| Player input only: `SVC_USER_COMMANDS` | 2.7× | 1.8× | — |
| One chat message type, no entities and no user commands | 5.0× | 3.7× | 4.2× |

Absolute numbers and memory usage are in the performance sections of [`@deademx/deadlock`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadlock/README.md#performance), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md#performance) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md#performance).

### Stream Tuning

Without breaks, a long parse, seek or cut freezes a UI. Every N demo packets, where N is `breakInterval`, the engine yields to the event loop, so timers, input and rendering run in between. A lower value makes a UI more responsive and costs a little speed. The default is 1000.

```js
new Parser(new ParserConfiguration({ breakInterval: 100 }));
```

### Tips

- Filter exactly what is needed. The biggest performance gain.

- Lower `breakInterval` in a browser. The default `1000` suits Node.js. [Deadem Explorer](https://deadem.com) uses `100` to keep the UI responsive.

- Mind the call count. A 500 MB Deadlock demo can trigger ~150k `InterceptorStage.DEMO_PACKET` calls, ~3M `InterceptorStage.MESSAGE_PACKET` calls, and ~10M entity events with ~100M field updates. Heavy work inside `InterceptorStage.MESSAGE_PACKET` or `InterceptorStage.ENTITY_PACKET` interceptors compounds quickly.

- Use `InterceptorStage.ENTITY_PACKET` only when per-entity diffs between ticks are needed. For current state such as positions or health, read `Demo` from an `InterceptorStage.DEMO_PACKET` interceptor instead.

- Sample instead of reading every tick. A UI rarely needs a value at every tick. Once per second means every 64 ticks in Deadlock and Counter-Strike 2 and every 30 ticks in Dota 2.

- Read only what is needed. Prefer point reads via `entity.getField('name')` over `entity.unpackFlattened()` and field iterators. Entity state is stored in typed arrays, and values materialize only on read. The JSDoc of [`Entity.getField`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) describes the cost.

## Types

`@deademx/engine` and the game packages ship TypeScript declarations. Packet `data` is `unknown` until `is()` narrows it to a type from the game's `.proto` files.

```ts
parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.is(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE)) {
        console.log(messagePacket.data.text); // string
    }
});
```

Entity fields have no static types. [Deadem Explorer](https://deadem.com) shows the fields of every entity with their types and values, and `getField<T>()` takes the expected type as `T`:

```ts
const health = pawn.getField<number>('m_iHealth'); // number, an unset field is undefined
```

## Vocabulary

| Term | Meaning | Code |
| --- | --- | --- |
| Baseline | The default field values of a class. A new entity starts from them. | [`ClassBaseline`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/ClassBaseline.js) |
| Class | The type of an entity, for example `CCitadelPlayerPawn`. It defines the fields. | [`Class`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Class.js) |
| Cutter | Indexes a demo in one pass, then cuts a tick window into a standalone `.dem` file. | [`Cutter`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/cut/Cutter.js) |
| Demo | The state at the current tick: entities, string tables, user commands and server info. | [`Demo`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) |
| Demo packet | An outer packet of a demo stream, one of 19 types. | [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), [`DemoPacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js) |
| Entity | An object of the game world with a class and named fields, for example a hero or an ability. | [`Entity`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) |
| Field | A named value of an entity, for example `m_iHealth`. Dots join nested names. | [`Field`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/fields/Field.js) |
| Handle | A number that references an entity by its index and a serial. | [`Demo.getEntityByHandle`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) |
| Interceptor | A callback that receives each packet before or after the engine applies it. | [`InterceptorStage`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/InterceptorStage.js) |
| Message packet | An inner packet of a demo packet, for example an entity update or a chat message. Each game package adds its own `MessagePacketType` values. | [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) |
| Parser | Reads a demo once, from start to end. | [`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js) |
| Player | Buffers a demo, then seeks, steps and plays it. | [`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/player/Player.js) |
| Snapshot | The state of entities and string tables in a `DEM_FULL_PACKET`, about once a minute. `Player` uses it to seek and `Cutter` uses it to start a clip. | — |
| String table | A data container with indexed entries, each with a text string and optional binary data. | [`StringTable`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTable.js), [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js) |
| Tick | One step of the server simulation, usually 64 per second in Deadlock and Counter-Strike 2 and 30 in Dota 2. | [`Server`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Server.js) (`tickRate`) |
| User command | The input of one player at a tick: buttons, view angles and movement. | [`UserCommand`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommand.js) |

## Useful Links

- [Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking): ticks, snapshots and delta compression.
- [Networking Events & Messages](https://developer.valvesoftware.com/wiki/Networking_Events_%26_Messages): network messages, game events and string tables.
- [Networking Entities](https://developer.valvesoftware.com/wiki/Networking_Entities): entities and their networked fields.
- [Usercmd](https://developer.valvesoftware.com/wiki/Usercmd): user commands.
- [Counter-Strike: Global Offensive Broadcast](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Broadcast): the HTTP broadcast protocol.
- [DEM (file format)](https://developer.valvesoftware.com/wiki/DEM_Format): the header and frames of the older demo format.
- [Demo Recording Tools](https://developer.valvesoftware.com/wiki/Demo_Recording_Tools): recording and playing demos.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
