<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deadem/dota2
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deadem/dota2" alt=""><img src="https://img.shields.io/npm/v/%40deadem%2Fdota2" /></a>

**@deadem/dota2** is a JavaScript library for parsing and playing back Dota 2 (Valve Source 2 Engine) demo files, compatible with Node.js and modern browsers.
Built on top of [`@deadem/engine`](https://www.npmjs.com/package/@deadem/engine).

## Contents

* [Installation](#installation)<br/>
  Installing and including the library in your project.

* [Examples](#examples)<br/>
  Running example scripts and working with demo files.

* [Overview](#overview)<br/>
  Core concepts and architecture of the parser.

  * [Understanding Demo](#understanding-demo)<br/>
    Structure and content of demo files.

  * [Understanding Parser](#understanding-parser)<br/>
    Parser internals and state management.

  * [Understanding Player](#understanding-player)<br/>
    Replay playback with seek-to-tick support.

  * [Understanding Interceptors](#understanding-interceptors)<br/>
    Extracting data during parsing.

* [Configuration](#configuration)<br/>
  Customizing parser options and behavior.

* [Usage](#usage)<br/>
  Usage examples with real game data.

  * [Demo File](#demo-file)<br/>
    Parsing demo using `.dem` file.

  * [Data Extraction](#data-extraction)<br/>
    Extracting data during parsing.

  * [Player](#player)<br/>
    Replay playback and tick-based seeking.

* [Compatibility](#compatibility)<br/>
  Supported environments and versions.

* [Performance](#performance)<br/>
  Benchmark results across platforms.

* [Building](#building)<br/>
  Setup and build instructions.

* [License](#license)<br/>
  Project licensing information.

* [Acknowledgements](#acknowledgements)<br/>
  Credits to upstream and inspiring projects.

## Installation

### Node.js

```shell
npm install @deadem/dota2 --save
```

```js
import { Parser } from '@deadem/dota2';
```

### Browser

```js
<script src="//cdn.jsdelivr.net/npm/@deadem/dota2@0.X.X/dist/deadem-dota2.min.js"></script>
```

```js
const { Parser } = window.deademDota2;
```

## Examples

### Node.js

The example scripts will, by default, look for demo files in the `/demos` folder.
If no local demo file is found, the scripts will automatically download the required file from a public S3 bucket.

#### Parsing

| №                                                                                                                           | Description                | Commands                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| [100](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js)                    | Parse a single replay file | `node ./packages/examples-node-dota2/scripts/100_parse.js`                 |

## Overview

### Understanding Demo

The demo file consists of a sequential stream of outer packets, referred to in this project as [DemoPacket](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js).
Each packet represents a type defined in [DemoPacketType](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/enums/DemoPacketType.js).

Most [DemoPacket](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/DemoPacket.js) types, once parsed, become plain JavaScript objects containing structured data. However,
some packet types — such as `DemoPacketType.DEM_PACKET`, `DemoPacketType.DEM_SIGNON_PACKET`, and
`DemoPacketType.DEM_FULL_PACKET` — encapsulate an array of inner packets, referred to in this project as [MessagePacket](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js). These inner packets
correspond to message types defined in [MessagePacketType](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/data/enums/MessagePacketType.js).

Similarly, most [MessagePacket](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/MessagePacket.js) types also parse into regular data objects. There are two notable exceptions that require additional parsing:
  1. **Entities** ([Developer Wiki](https://developer.valvesoftware.com/wiki/Networking_Entities)) - `MessagePacketType.SVC_PACKET_ENTITIES`: contains granular (or full) updates to existing entities (i.e. game world objects).
  2. **String Tables** ([Developer Wiki](https://developer.valvesoftware.com/wiki/String_Table_Dictionary)) - `MessagePacketType.SVC_CREATE_STRING_TABLE`, `MessagePacketType.SVC_UPDATE_STRING_TABLE`, `MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES`: granular (or full) updates to existing string tables.

> ⚠️ **Warning**
>
> Demo files contain only the minimal data required for visual playback — not all game state information is preserved or available. Additionally, the parser may skip packets it cannot decode.
>
> You can retrieve detailed statistics about parsed and skipped packets by calling `parser.getStats()`.

The [Demo](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) object is updated tick by tick and exposes query methods for the current game state:

- `demo.getEntities()` — all live entities.
- `demo.getEntitiesByClassName(className)` — entities filtered by class name.
- `demo.getEntity(index)` — a single entity by index.
- `demo.getClasses()` — all registered entity classes.

### Understanding Parser

The parser accepts a readable stream and incrementally parses individual packets from it.
It maintains an internal, **mutable** instance of [Demo](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js), which represents the current state of the game. You can access it by calling:

```js
const demo = parser.getDemo();
```

> Note: The parser overwrites the existing state with each tick and **does not** store past states.

The parser also supports pausing and resuming mid-stream:

```js
parser.pause();   // pauses after the current packet finishes processing
parser.resume();  // resumes from where it left off
```

Once parsing is complete, call `dispose()` to release internal resources (workers, allocated state):

```js
await parser.dispose();
```

### Understanding Player

[Player](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/Player.js) is a higher-level class built on top of the parser engine for **replay playback**. Unlike the parser, which processes a stream sequentially and discards past state, the player buffers the entire demo on `load()` and builds an internal packet index — enabling **seek-to-tick** in both directions.

```js
const player = new Player();

await player.load(readable);              // buffer + index the replay
await player.seekToTick(50000);           // jump to any tick
await player.nextTick();                  // advance one tick
await player.prevTick();                  // go back one tick
await player.play(2.0).catch((err) => {   // rejects with PlaybackInterruptedError on pause() or stop()
    if (!(err instanceof PlaybackInterruptedError)) throw err;
});
player.pause();                           // pause during play()
await player.stop();                      // stop and reset to the first tick
await player.dispose();                   // release all resources
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

| State      | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `IDLE`     | Initial state. `load()` or `dispose()` can be called.             |
| `LOADED`   | Demo is buffered and indexed. Ready for all operations.            |
| `PLAYING`  | Continuous playback is running.                                    |
| `SEEKING`  | A `seekToTick()` call is in progress.                              |
| `DISPOSED` | Resources released. The player cannot be used further.             |

The current state is exposed via `player.state`.

The player exposes the same interceptor API as the parser (`registerPreInterceptor`, `registerPostInterceptor`, `unregisterPreInterceptor`, `unregisterPostInterceptor`) — see [Understanding Interceptors](#understanding-interceptors).

> **Note**
>
> `Player` does not support `parserThreads > 0` — parallel parsing is not available in playback mode.

### Understanding Interceptors

Interceptors are user-defined functions that hook into the parsing process **before** or **after** specific stages (called `InterceptorStage`).
They allow you to inspect and extract desired data during parsing.
Currently, there are three supported stages:

  - `InterceptorStage.DEMO_PACKET`
  - `InterceptorStage.MESSAGE_PACKET`
  - `InterceptorStage.ENTITY_PACKET`

Use the following methods to register hooks:

- **Before** the [Demo](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) state is affected:  
  `parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, hookFn);`

- **After** the [Demo](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/src/data/Demo.js) state is affected:  
  `parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, hookFn);`

The diagram below provides an example of the parsing timeline, showing when **pre** and **post** interceptors are invoked at each stage:

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

Each interceptor receives different arguments depending on the `InterceptorStage`:

| Interceptor Stage | Hook Type      | Hook Signature                                                                                                                                                                                                                                                              |
|-------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DEMO_PACKET`     | `pre` / `post` | (demoPacket: DemoPacket) => void                                                                                                                                                                                                                                            |
| `MESSAGE_PACKET`  | `pre` / `post` | (demoPacket: DemoPacket, messagePacket: MessagePacket) => void                                                                                                                                                                                                              |
| `ENTITY_PACKET`   | `pre` / `post` | (demoPacket: DemoPacket, messagePacket: MessagePacket, events: Array\<EntityMutationEvent\>) => void                                                                                                                                                                        |

> ❗ **Important**
>
> Interceptor hooks are **not blocking** — the parser does not `await` async callbacks. If you pass an `async` function, it will be invoked but its returned promise will not be awaited, so async work runs concurrently with the parser. Use **synchronous** interceptors if you need data to be captured before the parser moves to the next packet.

## Configuration

### Parsing

Below is a list of available options that can be passed to the `ParserConfiguration`:

| Option                       | Description                                                                                                                                                               | Type                              | Default |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| `breakInterval`              | How often (in packets) to yield to the event loop to avoid blocking. The smaller the value, the more responsive the interface will be (may slow down parser performance). | `number`                          | `1000`  |
| `messagePacketTypes`         | Allowlist of `MessagePacketType` values to process. Packets not in this list are skipped. Mutually exclusive with `messagePacketTypesExclude`. See note below.            | `Array<MessagePacketType>` \| `null` | `null`  |
| `messagePacketTypesExclude`  | Blocklist of `MessagePacketType` values to skip. Mutually exclusive with `messagePacketTypes`. See note below.                                                            | `Array<MessagePacketType>` \| `null` | `null`  |
| `parserThreads`              | Number of **additional** threads used by the parser.                                                                                                                      | `number`                          | `0`     |

> **Note** — Critical packet types
>
> The following `MessagePacketType` values are always processed regardless of `messagePacketTypes` / `messagePacketTypesExclude`, because the parser requires them to maintain internal state:
> `SVC_SERVER_INFO`, `SVC_CREATE_STRING_TABLE`, `SVC_UPDATE_STRING_TABLE`, `SVC_CLEAR_ALL_STRING_TABLES`.

**Example — exclude entity packets for a faster parse when entity data is not needed:**

```js
import { MessagePacketType, Parser, ParserConfiguration } from '@deadem/dota2';

const parser = new Parser(new ParserConfiguration({
    messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
}));
```

**Example — process only specific packet types:**

```js
import { MessagePacketType, Parser, ParserConfiguration } from '@deadem/dota2';

const parser = new Parser(new ParserConfiguration({
    messagePacketTypes: [
        MessagePacketType.DOTA_UM_CHAT_MESSAGE
    ]
}));
```

### Logging

The library provides a `Logger` class with several pre-defined logging strategies. For example:
  - `Logger.CONSOLE_WARN` — only logs warnings and errors.
  - `Logger.NOOP` - disables all logging.

```js
import { Logger, Parser, ParserConfiguration } from '@deadem/dota2';

const configuration = new ParserConfiguration({ parserThreads: 2 });

const parser = new Parser(configuration, Logger.CONSOLE_WARN);
```

## Usage

### Demo File

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deadem/dota2';

const parser = new Parser();
const printer = new Printer(parser);

const readable = createReadStream(PATH_TO_DEM_FILE);

await parser.parse(readable);
await parser.dispose();

printer.printStats();
```

### Data Extraction

**Interceptors** — use when you need to capture data *during* parsing, tick by tick:

```js
import { InterceptorStage, MessagePacketType, Parser } from '@deadem/dota2';

// Extracting chat messages as they appear
parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.DOTA_UM_CHAT_MESSAGE) {
        console.log(`CHAT_MESSAGE: ${messagePacket.data.text}`);
    }
});

await parser.parse(readable);
```

**Post-parse queries** — use when you only need the final game state:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntities();
// use demo.getEntitiesByClassName(className) to filter by a specific Dota 2 entity class
```

### Player

`Player` buffers the entire replay on `load()` and builds a tick index, enabling seek-to-tick in both directions without re-reading the stream.

**Inspecting game state at a specific tick:**

```js
import { createReadStream } from 'node:fs';

import { InterceptorStage, Player } from '@deadem/dota2';

const player = new Player();

// Register interceptors before load() — they fire on every seekToTick() call
player.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
    // inspect events ...
});

const readable = createReadStream(PATH_TO_DEM_FILE);

await player.load(readable);

console.log(`Ticks: [ ${player.getFirstTick()} ] — [ ${player.getLastTick()} ]`);

await player.seekToTick(player.getLastTick());

const demo = player.getDemo();
const entities = demo.getEntities();

await player.dispose();
```

**Continuous playback:**

```js
import { createReadStream } from 'node:fs';

import { PlaybackInterruptedError, Player } from '@deadem/dota2';

const player = new Player();
const readable = createReadStream(PATH_TO_DEM_FILE);

await player.load(readable);

// play() resolves when the replay ends, rejects with PlaybackInterruptedError on pause() or stop()
const playback = player.play(2.0).catch((err) => {
    if (!(err instanceof PlaybackInterruptedError)) {
        throw err;
    }
});

setTimeout(() => player.pause(), 3000);

await playback;

await player.dispose();
```

## Compatibility

* **Node.js:** v18.0.0 and above.
* **Browsers:** All modern browsers, including the latest versions of Chrome, Firefox, Safari, Edge.

## Performance

## Building

### 1. Installing dependencies

```shell
npm install
```

### 2. Compiling .proto

```shell
npm run proto:json
```

### 3. Building a bundle

```shell
npm run build
```

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.

## Acknowledgements

This project was inspired by and built upon the work of the following repositories:

- [dotabuff/manta](https://github.com/dotabuff/manta) - Dotabuff's Dota 2 replay parser in Go.
- [saul/demofile-net](https://github.com/saul/demofile-net) - CS2 / Deadlock replay parser in C#.

Huge thanks to their authors and contributors!
