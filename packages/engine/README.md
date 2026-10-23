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

**@deademx/engine** is the shared Source 2 core of [`@deademx/deadlock`](https://www.npmjs.com/package/@deademx/deadlock) (Deadlock), [`@deademx/cs2`](https://www.npmjs.com/package/@deademx/cs2) (Counter-Strike 2) and [`@deademx/dota2`](https://www.npmjs.com/package/@deademx/dota2) (Dota 2).

The engine provides common classes for working with Source 2 demos. It does not run on its own and relies on configuration from a game package: the `.proto` files of the game and decoder instructions.

> [!NOTE]
> All examples use `@deademx/deadlock`. The API is the same for the other games.

## Contents

- [Quick Start](#quick-start)<br/>
  Player names and kills.
- [How It Works](#how-it-works)<br/>
  Ticks, deltas, packets and snapshots.
- [Where Data Lives](#where-data-lives)<br/>
  Stateful data, stateless data and deltas.
  - [Stateful Data](#stateful-data)<br/>
    `Demo` at the current tick.
    - [Entities](#demo--entities)<br/>
      Game objects and handles.
    - [String Tables](#demo--string-tables)<br/>
      Indexed strings and data.
    - [User Commands](#demo--user-commands)<br/>
      Player input per slot.
  - [Stateless Data](#stateless-data)<br/>
    Data that only interceptors see.
  - [Deltas](#deltas)<br/>
    Changes of stateful data.
- [Interceptors](#interceptors)<br/>
  Callbacks before or after each packet.
  - [`InterceptorStage.DEMO_PACKET`](#interceptorstagedemo_packet)<br/>
    Every demo packet.
  - [`InterceptorStage.MESSAGE_PACKET`](#interceptorstagemessage_packet)<br/>
    Every message packet.
  - [`InterceptorStage.ENTITY_PACKET`](#interceptorstageentity_packet)<br/>
    Entity changes.
  - [`InterceptorStage.STRING_TABLE`](#interceptorstagestring_table)<br/>
    String table changes.
  - [`InterceptorStage.USER_COMMAND`](#interceptorstageuser_command)<br/>
    User commands.
  - [Interceptor Flow](#interceptor-flow)<br/>
    The order of calls.
- [Player](#player)<br/>
  Seeking, stepping and playback.
  - [Seeking](#seeking)<br/>
    The state at any tick.
  - [State](#state)<br/>
    The state machine.
  - [Navigation](#navigation)<br/>
    One tick forward or back.
  - [Playback](#playback)<br/>
    Real-time playback and its interruptions.
- [HTTP Broadcast](#http-broadcast)<br/>
  Parsing a live match.
- [Configuration & Tuning](#configuration--tuning)<br/>
  Filters and event loop breaks.
  - [Filters](#filters)<br/>
    Decoding only what is needed.
  - [Stream Tuning](#stream-tuning)<br/>
    `breakInterval` and UI responsiveness.
- [Performance](#performance)<br/>
  Speedups of the filters.
  - [Tips](#tips)<br/>
    How to keep parsing fast.
- [Types](#types)<br/>
  TypeScript and `is()`.
- [Vocabulary](#vocabulary)<br/>
  Terms and their code.
- [Useful Links](#useful-links)<br/>
  Articles on networking and demos.
- [License](#license)<br/>
  MIT.

## Quick Start

```bash
npm install @deademx/deadlock
```

```js
import { createReadStream } from 'node:fs';

import { Parser } from '@deademx/deadlock';

(async () => {
    const parser = new Parser();
    const stream = createReadStream('./match.dem');

    await parser.parse(stream);

    const demo = parser.getDemo();

    for (const controller of demo.getEntitiesByClassName('CCitadelPlayerController')) {
        console.log(controller.getField('m_iszPlayerName'), controller.getField('m_PlayerDataGlobal.m_iPlayerKills'));
    }

    await parser.dispose(); // cleanup state and resources
})();
```

## How It Works

A demo (`.dem`) is a recording of a match: a sequence of frames and network packets that the game engine replays. The parser reads a stream of bytes, decomposes frames and network packets, decompresses their payloads and provides an API to consume the decoded data.

The structure of a demo follows from how the server simulates a match: in discrete time steps called `ticks`. For example, Deadlock and Counter-Strike 2 usually use a tick rate of 64, which means 64 time steps in a second, or one every 15.625 ms. Saving the full world state at every tick is inefficient, so the format uses deltas: the demo stores only what has changed since the previous tick. Therefore, the state at a tick is the result of all deltas applied up to that tick.

The stream has two layers of packets. The outer layer consists of frames. This project calls them demo packets (`DemoPacket`). The inner layer consists of messages from the game server, such as entity updates, chat and sounds. This project calls them message packets (`MessagePacket`). There are 19 types of demo packets, and each game package supports about 70–200 types of message packets. Three types of demo packets, `DEM_SIGNON_PACKET`, `DEM_PACKET` and `DEM_FULL_PACKET`, carry network packets with these messages.

```text
.dem (simplified)
 ├─ tick -1
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

The engine accumulates deltas in the state for three kinds of data: `Entities`, `String Tables` and `User Commands`, which will be covered in the next sections.

When a single pass is needed, sequential reading suits it perfectly. However, for random access, it is inefficient: a seek to the middle of a match would require applying the deltas of the entire first half. To make random access efficient, a demo also contains a snapshot (`DEM_FULL_PACKET`) approximately every 60 seconds. A snapshot contains the full state of entities and string tables. Instead of applying deltas from the beginning of the stream, a seek applies them from the nearest earlier snapshot.

The engine exports two classes for these two ways of reading:

- `Parser` reads a demo once and sequentially, as fast as possible.
- `Player` buffers the demo, indexes its snapshots and provides playback at real-time speed (or another rate) and seeking to any tick.

Both classes provide the same [interceptor](#interceptors) API.

## Where Data Lives

The engine accumulates stateful data in `Demo`, while stateless data, such as sound events and kills, exists only in packets and can be accessed with interceptors.

### Stateful Data

Stateful data consists of entities, string tables and user commands. `parser.getDemo()` and `player.getDemo()` return the `Demo`, which holds this data at the current tick. The engine mutates the `Demo` object as it applies packets and never replaces it.

When `parse()` returns, `Demo` holds the end of the match. The example below captures the state at a specific tick and prints the net worth of every player 10 minutes into the demo:

```js
import { createReadStream } from 'node:fs';

import { InterceptorStage, Parser } from '@deademx/deadlock';

const TICK = 10 * 60 * 64; // 10 minutes into the demo at 64 ticks per second

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

#### Demo → Entities

An entity is a game object, such as a weapon, a creep or an ability, with a class name and fields. The `SVC_PACKET_ENTITIES` message packet carries its updates.

In Deadlock, a player is two entities. The pawn `CCitadelPlayerPawn` holds the hero's position and health, and the controller `CCitadelPlayerController` the name and net worth. Handle fields, usually `m_h*`, link entities. `demo.getEntityByHandle()` resolves them:

```js
for (const pawn of demo.getEntitiesByClassName('CCitadelPlayerPawn')) {
    const controller = demo.getEntityByHandle(pawn.getField('m_hController'));

    if (controller === null) continue;

    console.log(controller.getField('m_iszPlayerName'), pawn.getField('m_iHealth'));
}
```

#### Demo → String Tables

A string table is a data container with indexed entries, each with a text string and optional binary data. `DEM_STRING_TABLES`, `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE` and `SVC_CLEAR_ALL_STRING_TABLES` carry its changes. For example, `userinfo` stores player names, and `ActiveModifiers` stores active buffs and debuffs.

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
> `USER_INFO` keeps an entry only while its player is connected, so after `parse()` most entries are empty.

#### Demo → User Commands

A user command is the network representation of a player's input, such as pressed buttons, view angles and movement. The `SVC_USER_COMMANDS` message packet carries it. Dota 2 demos contain no user commands.

`demo.getUserCommands()` returns the latest command of every player slot, and the controller of slot N is entity N + 1.

```js
for (const command of demo.getUserCommands()) {
    const controller = demo.getEntity(command.slot + 1);

    if (controller === null) continue;

    console.log(controller.getField('m_iszPlayerName'), command.state.base.viewangles);
}
```

### Stateless Data

Stateless data is everything else that packets carry. The engine does not keep it, and only [interceptors](#interceptors) receive it. In Deadlock, the message packet `CITADEL_USER_MESSAGE_DAMAGE` holds the attacker, the victim and the amount of damage. The demo packet `DEM_FILE_HEADER` holds the map and the server name.

### Deltas

A delta is a change of stateful data. Three interceptor stages report deltas: `ENTITY_PACKET` for entities, `STRING_TABLE` for string tables and `USER_COMMAND` for user commands. Each event holds only what has changed, for example the changed fields of an entity. The [Interceptors](#interceptors) section describes them.

## Interceptors

An interceptor is a callback for one `InterceptorStage`. The engine calls it before (`PRE`) or after (`POST`) applying a packet to `Demo`, so `PRE` sees the previous state and `POST` the new one. `Parser` and `Player` provide four methods:

- `registerPreInterceptor(stage, callback)` and `registerPostInterceptor(stage, callback)` add an interceptor.
- `unregisterPreInterceptor(stage, callback)` and `unregisterPostInterceptor(stage, callback)` remove it.

Interceptors are synchronous, and the engine does not await a returned promise.

| Stage | Hook signature |
| --- | --- |
| `DEMO_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js)) => void |
| `MESSAGE_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js)) => void |
| `ENTITY_PACKET` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), events: Array<[`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js)>) => void |
| `STRING_TABLE` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js) \| null, events: Array<[`StringTableMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableMutationEvent.js)>) => void |
| `USER_COMMAND` | (demoPacket: [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), messagePacket: [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), events: Array<[`UserCommandEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommandEvent.js)>) => void |

### `InterceptorStage.DEMO_PACKET`

One call per demo packet.

```js
import { InterceptorStage, Parser } from '@deademx/deadlock';

const parser = new Parser();

parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
    console.log(`Tick [ ${demoPacket.tick} ] | Type [ ${demoPacket.type.code} ]`);
});
```

### `InterceptorStage.MESSAGE_PACKET`

One call per message packet.

```js
import { MessagePacketType } from '@deademx/deadlock';

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (!messagePacket.is(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE)) return;

    console.log(`Tick [ ${demoPacket.tick} ] | Slot [ ${messagePacket.data.playerSlot} ] | ${messagePacket.data.text}`);
});
```

### `InterceptorStage.ENTITY_PACKET`

One call per `SVC_PACKET_ENTITIES` message, with an [`EntityMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/EntityMutationEvent.js) for every changed entity.

```js
import { EntityOperation } from '@deademx/deadlock';

parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (event.operation !== EntityOperation.UPDATE) continue;
        if (event.entity.class.name !== 'CCitadelPlayerPawn') continue;

        const [health] = event.getChanges(['m_iHealth']);

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
| `LEAVE` | The server stops sending the entity. It stays in `Demo` with `entity.active` set to `false` | Empty |
| `DELETE` | The entity is removed from `Demo` | Empty |

### `InterceptorStage.STRING_TABLE`

One call per `DEM_STRING_TABLES` (demo packet) and per `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE` or `SVC_CLEAR_ALL_STRING_TABLES` (message packets), with a [`StringTableMutationEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTableMutationEvent.js) for every changed table.

```js
import { StringTableOperation, StringTableType } from '@deademx/deadlock';

parser.registerPreInterceptor(InterceptorStage.STRING_TABLE, (demoPacket, messagePacket, events) => {
    for (const event of events) {
        if (!event.table.is(StringTableType.USER_INFO) || event.operation !== StringTableOperation.UPDATE) continue;

        for (const entry of event.entries) {
            const before = event.table.getEntryById(entry.id)?.value ?? null; // PRE: the table still holds the previous entry
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

One call per `SVC_USER_COMMANDS` or `SVC_USER_COMMAND_KEYFRAME` message, with a [`UserCommandEvent`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommandEvent.js) for every command. `event.userCommand` is the updated command, and `event.getChanges()` returns what the command changed, in the shape of `state`.

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


## Player

`Parser` reads a demo once, from start to end. `Player` seeks backward and forward, steps tick by tick and plays the demo at real-time speed or at any other rate. `Player` reads the whole demo with `load()` and indexes its snapshots. `Player` does not support HTTP broadcast yet.

### Seeking

`Player` provides `seekToTick(tick)`, which starts from the nearest earlier snapshot and applies deltas up to `tick`. Seek time grows with distance from that snapshot.

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

`Player` provides two methods to move one tick at a time:

- `player.nextTick()` is synchronous and cheap, because it applies one delta. At the last tick it returns `false`.
- `player.prevTick()` is asynchronous and costs as much as a seek, because it starts from the nearest earlier snapshot.

```js
await player.seekToTick(10 * 60 * 64); // 10 minutes into the demo at 64 ticks per second

for (let i = 0; i < 10 && player.nextTick(); i++) { // 10 ticks forward
    console.log(`Tick [ ${player.getCurrentTick()} ]`);
}
```

### Playback

`Player` provides `play(rate)`, which plays the demo in real time. The `rate` argument multiplies the speed. The returned promise:

- Resolves when playback reaches the last tick.
- Rejects with a `PlaybackInterruptedError` with the `reason` `'paused'` after `player.pause()` or `player.seekToTick()`.
- Rejects with a `PlaybackInterruptedError` with the `reason` `'stopped'` after `player.stop()`.
- Rejects with a `PlaybackInterruptedError` with the `reason` `'disposed'` after `player.dispose()`.
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

## HTTP Broadcast

HTTP broadcast delivers a live match over HTTP in fragments. The engine provides two classes for it:

- `BroadcastGateway` requests fragments from a broadcast server.
- `BroadcastAgent` follows one match, downloads its fragments and turns them into a stream. After 30 seconds without a new fragment, the agent stops.

The structure of the broadcast differs from that of a `.dem` file, so `Parser` needs the source explicitly: `DemoSource.HTTP_BROADCAST`.

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser } from '@deademx/deadlock';

const MATCH_ID = 'MATCH_IDENTIFIER_AND_SALT';

const gateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const agent = new BroadcastAgent(gateway, MATCH_ID);

const parser = new Parser();

await parser.parse(agent.stream(), DemoSource.HTTP_BROADCAST);
```

By default, `agent.stream()` starts four fragments before the fragment that the server reports in `/sync`, close to the live moment. `agent.stream(true)` starts from the first fragment of the broadcast.

## Configuration & Tuning

`Parser` and `Player` take a `ParserConfiguration` in the constructor. Without one, both use `ParserConfiguration.DEFAULT`.

### Filters

Filters are the primary lever for parser performance — reducing decoded data cuts both memory and time.

| Option | Type | Default | Filters |
| --- | --- | --- | --- |
| `entityClasses` | `Array<string>\|null` | `null` | Which entity classes get their fields decoded |
| `messagePacketTypes` | `Array<MessagePacketType>\|null` | `null` | Allowlist of message types |
| `messagePacketTypesExclude` | `Array<MessagePacketType>\|null` | `null` | Blocklist of message types |

Four message packets always pass the message filter, because the engine needs them internally: `SVC_SERVER_INFO`, `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE` and `SVC_CLEAR_ALL_STRING_TABLES`.

```js
import { MessagePacketType, Parser, Player, ParserConfiguration } from '@deademx/deadlock';

// Skips all entities: everything else is decoded.
const configA = new ParserConfiguration({
    messagePacketTypesExclude: [MessagePacketType.SVC_PACKET_ENTITIES]
});

// Decodes only entities, and only the fields of player pawns and controllers.
const configB = new ParserConfiguration({
    messagePacketTypes: [MessagePacketType.SVC_PACKET_ENTITIES],
    entityClasses: ['CCitadelPlayerPawn', 'CCitadelPlayerController']
});

new Parser(configA);
new Player(configB);
```

### Stream Tuning

Without breaks, a long parse or seek freezes a UI. Every N demo packets, where N is `breakInterval`, the engine yields to the event loop, so timers, input and rendering run in between. A lower value makes a UI more responsive and costs a little speed. The default is 1000.

```js
new Parser(new ParserConfiguration({ breakInterval: 100 }));
```

## Performance

Entity decoding (`SVC_PACKET_ENTITIES`) accounts for most of the parser's work. `SVC_USER_COMMANDS` is a distant second. Everything else combined is minor. The table shows the parse speed relative to the default configuration.

| Configuration | Deadlock | Counter-Strike 2 | Dota 2 |
| --- | --- | --- | --- |
| Everything, `ParserConfiguration.DEFAULT` | 1× | 1× | 1× |
| One entity class: `SVC_PACKET_ENTITIES` + `entityClasses` with the player controller | 3.7× | 2.8× | 2.3× |
| Player input only: `SVC_USER_COMMANDS` | 2.7× | 1.8× | — |
| One chat message type, no entities and no user commands | 5.0× | 3.7× | 4.2× |

The absolute numbers and the memory usage are in the performance sections of [`@deademx/deadlock`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadlock/README.md#performance), [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md#performance) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md#performance).

### Tips

- Filter exactly what is needed. The biggest performance gain.

- Lower `breakInterval` in a browser. The default `1000` suits Node.js. [Deadem Explorer](https://deadem.com) uses `100` to keep the UI responsive.

- Mind the call count. A 500 MB Deadlock demo may contain ~150k `InterceptorStage.DEMO_PACKET` calls, ~3M `InterceptorStage.MESSAGE_PACKET` calls, and ~10M entity events with ~100M field updates. Heavy work in the `InterceptorStage.MESSAGE_PACKET` interceptor compounds fast and can tank performance.

- Use `InterceptorStage.ENTITY_PACKET` only when per-entity diffs between ticks are needed. To simply read current state — player positions, health, etc. — use `Demo` from an `InterceptorStage.DEMO_PACKET` interceptor instead.

- Sample instead of reading every tick. A UI rarely needs a value at every tick. Once per second means every 64 ticks in Deadlock and Counter-Strike 2 and every 30 ticks in Dota 2.

- Read as much as needed. Prefer point reads via `entity.getField('name')` over `entity.unpackFlattened()` and the field iterators. Entity state is stored in typed arrays, and values materialize only on read. The JSDoc of [`Entity.getField`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) describes the cost.

## Types

`@deademx/engine` and the game packages ship TypeScript declarations. Packet `data` is `unknown` until `is()` narrows it to a type from the game's `.proto` files. String tables and entries have `is()` too.

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
| Demo | The state at the current tick: entities, string tables, user commands and server info. | [`Demo`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) |
| Demo packet | An outer packet of a demo stream, one of 19 types. | [`DemoPacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js), [`DemoPacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js) |
| Entity | An object of the game world with a class and named fields, for example a hero or an ability. | [`Entity`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/entity/Entity.js) |
| Field | A named value of an entity, for example `m_iHealth`. Dots join nested names. | [`Field`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/fields/Field.js) |
| Handle | A number that references an entity by its index and a serial. | [`Demo.getEntityByHandle`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) |
| Interceptor | A callback that receives each packet before or after the engine applies it. | [`InterceptorStage`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/InterceptorStage.js) |
| Message packet | An inner packet of a demo packet, for example an entity update or a chat message. Each game package adds its own `MessagePacketType` values. | [`MessagePacket`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js), [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/MessagePacketType.js) |
| Parser | Reads a demo once, from start to end. | [`Parser`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Parser.js) |
| Player | Buffers a demo, then seeks, steps and plays it. | [`Player`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/player/Player.js) |
| Snapshot | The state of entities and string tables in a `DEM_FULL_PACKET`, about once a minute. The engine applies it only at the start of a seek. | — |
| String table | A data container with indexed entries, each with a text string and optional binary data. | [`StringTable`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/tables/string/StringTable.js), [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/StringTableType.js) |
| Tick | One step of the server simulation, usually 64 per second in Deadlock and Counter-Strike 2 and 30 in Dota 2. | [`Server`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Server.js) (`tickRate`) |
| User command | The input of one player at a tick: buttons, view angles and movement. | [`UserCommand`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/UserCommand.js) |

## Useful Links

- [Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking): ticks, snapshots and delta compression.
- [Networking Events & Messages](https://developer.valvesoftware.com/wiki/Networking_Events_%26_Messages): network messages and game events.
- [Networking Entities](https://developer.valvesoftware.com/wiki/Networking_Entities): entities and their networked fields.
- [Usercmd](https://developer.valvesoftware.com/wiki/Usercmd): user commands.
- [Counter-Strike: Global Offensive Broadcast](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Broadcast): the HTTP broadcast protocol.
- [DEM (file format)](https://developer.valvesoftware.com/wiki/DEM_Format): the header and frames of the older demo format.
- [Demo Recording Tools](https://developer.valvesoftware.com/wiki/Demo_Recording_Tools): recording and playing demos.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
