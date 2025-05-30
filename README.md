<h1 align="center">
<img alt="deadem" src="https://deadem.s3.us-east-1.amazonaws.com/logo.svg" height="80" />
<br/>
deadem
<br/>
</h1>

<a href="https://www.npmjs.com/package/deadem" alt=""><img src="https://img.shields.io/npm/v/deadem" /></a>

**Deadem** is a JavaScript parser for Deadlock (Valve Source 2 Engine) demo/replay files, compatible with Node.js and modern browsers.

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
  
  * [Understanding Interceptors](#understanding-interceptors)<br/>
    Extracting data during parsing.

* [Usage](#usage)<br/>
  Basic usage example with real game data.

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
npm install deadem --save
```

```js
import { Parser } from 'deadem';
```

### Browser

```js
<script src="//cdn.jsdelivr.net"></script>
```

```js
const { Parser } = window.deadem;
```

## Examples

### Node.js

The example scripts will, by default, look for a demo file in the `/demos` folder.
If no demo file is found locally, they will automatically download one from a public S3 bucket:

```text
https://deadem.s3.us-east-1.amazonaws.com/deadlock/demos/${matchId}-{gameBuild?}.dem
```

A list of all available demo files can be found in the [DemoFile](./examples/common/DemoFile.js) class.


| №                                                         | Description       | Commands                                                                                                                                             |
|-----------------------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| [01](examples/runtime-node/01_parse.js)                   | Single demo       | `node ./examples/runtime-node/01_parse.js`                                                                                                           |
| [02](examples/runtime-node/02_parse_multiple.js)          | Multiple demos    | `node ./examples/runtime-node/02_parse_multiple.js --matches="36126255,36127043"`<br/>`node ./examples/runtime-node/02_parse_multiple --matches=all` |
| [10](examples/runtime-node/10_parse_game_time.js)         | Demo duration     | `node ./examples/runtime-node/10_parse_game_time.js`                                                                                                 |
| [11](examples/runtime-node/11_parse_top_damage_dealer.js) | Top damage dealer | `node ./examples/runtime-node/11_parse_top_damage_dealer.js`                                                                                         |

### Browser

| №                              | Description  | Commands    |
|--------------------------------|--------------|-------------|
| [01](examples/runtime-browser) | Example page | `npm start` |

## Overview

### Understanding Demo

The demo file consists of a sequential stream of outer packets, referred to in this project as [DemoPacket](./src/data/DemoPacket.js).
Each packet represents a type defined in [DemoPacketType](./src/data/enums/DemoPacketType.js).

Most [DemoPacket](./src/data/DemoPacket.js) types, once parsed, become plain JavaScript objects containing structured data. However,
some packet types — such as `DemoPacketType.DEM_PACKET`, `DemoPacketType.DEM_SIGNON_PACKET`, and
`DemoPacketType.DEM_FULL_PACKET` — encapsulate an array of inner packets, referred to in this project as [MessagePacket](./src/data/MessagePacket.js). These inner packets 
correspond to a message types defined in [MessagePacketType](./src/data/enums/MessagePacketType.js).

Similarly, most [MessagePacket](./src/data/MessagePacket.js) types also parse into regular data objects. There are two notable exceptions that require additional parsing:
  1. **Entities** ([Developier Wiki](https://developer.valvesoftware.com/wiki/Networking_Entities)) - `MessagePacketType.SVC_PACKET_ENTITIES`: contains granular (or full) updates to existing entities (i.e. game world objects).
  2. **String Tables** ([Developer Wiki](https://developer.valvesoftware.com/wiki/String_Table_Dictionary)) - `MessagePacketType.SVC_CREATE_STRING_TABLE`, `MessagePacketType.SVC_UPDATE_STRING_TABLE`, `MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES`: granular (or full) updates to existing string tables (see [StringTableType](./src/data/enums/StringTableType.js)).

> ⚠️ **Warning**
>
> Demo files contain only the minimal data required for visual playback — not all game state information is preserved or available. Additionally, the parser may skip packets it cannot decode.
>
> You can retrieve detailed statistics about parsed and skipped packets by calling `parser.getStats()`.

### Understanding Parser

The parser accepts a readable stream and incrementally parses individual packets from it.
It maintains an internal, **mutable** instance of [Demo](./src/data/Demo.js), which represents the current state of the game. You can access it by calling:

```js
const demo = parser.getDemo();
```

> Note: The parser overwrites the existing state with each tick and **does not** store past states.

### Understanding Interceptors

Interceptors are user-defined functions that hook into the parsing process **before** or **after** specific stages (called [InterceptorStage](./src/data/enums/InterceptorStage.js)).
They allow to inspect and extract desired data during parsing.
Currently, there are three supported stages:

  - `InterceptorStage.DEMO_PACKET`
  - `InterceptorStage.MESSAGE_PACKET`
  - `InterceptorStage.ENTITY_PACKET`

Use the following methods to register hooks:

- **Before** the [Demo](./src/data/Demo.js) state is affected:  
  `parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, hookFn);`

- **After** the [Demo](./src/data/Demo.js) state is affected:  
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

| Interceptor Stage | Hook Type      | Hook Signature                                                                                                                                                                                            |
|-------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DEMO_PACKET`     | `pre` / `post` | (demoPacket: [DemoPacket](./src/data/DemoPacket.js)) => void                                                                                                                                              |
| `MESSAGE_PACKET`  | `pre` / `post` | (demoPacket: [DemoPacket](./src/data/DemoPacket.js), messagePacket: [MessagePacket](./src/data/MessagePacket.js)) => void                                                                                 |
| `ENTITY_PACKET`   | `pre` / `post` | (demoPacket: [DemoPacket](./src/data/DemoPacket.js), messagePacket: [MessagePacket](./src/data/MessagePacket.js), events: Array<[EntityMutationEvent](./src/data/entity/EntityMutationEvent.js)>) => void |

> ❗ **Important**
> 
> Interceptors hooks are **blocking** — the internal packet analyzer waits for hooks to complete before moving forward.

## Usage

```js
import { InterceptorStage, MessagePacketType, Parser, Printer } from 'deadem';

const parser = new Parser();
const printer = new Printer(parser);

let gameTime = null;

// #1: Extraction of current game time
parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.NET_TICK) {
        const demo = parser.getDemo();
        
        // Ensure server is initialized
        if (demo.server === null) {
            return;
        }
        
        // Current tick
        const tick = messagePacket.data.tick;
        
        // Server tick rate
        const tickRate = demo.server.tickRate;
        
        // Translating current tick to seconds
        gameTime = tick / tickRate;
    }
});

const topDamageDealer = {
    player: null,
    damage: 0
};

// #2 Getting top hero-damage dealer 
parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, async (demoPacket, messagePacket, events) => {
    events.forEach((event) => {
        const entity = event.entity;
        
        if (entity.class.name === 'CCitadelPlayerController') {
            const data = entity.unpackFlattened();
            
            if (data.m_iHeroDamage > topDamageDealer.damage) {
                topDamageDealer.player = data.m_iszPlayerName;
                topDamageDealer.damage = data.m_iHeroDamage;
            }
        }
    });
});

await parser.parse(demoReadableStream);

// Printing final stats to the console
printer.printStats();

console.log(`Game finished in [ ${gameTime} ] seconds; top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
```

## Compatibility

Tested with Deadlock demo files from game build 5637 and below.

* **Node.js:** v16.17.0 and above.
* **Browsers:** All modern browsers, including the latest versions of Chrome, Firefox, Safari, Edge.

## Performance

By default, entities are **parsed but not unpacked**. Parser performance may vary depending on the number
of`entity.unpackFlattened()` calls.

The table below shows performance results **without calling `entity.unpackFlattened()`** for MacBook Pro with M3 chip:

|  # | Runtime               | Speed, ticks per second | Speed, game seconds per second (tick rate — 64) | Time to parse a 30-minute game, seconds | Max Memory Usage, mb |
|--------|-----------------------|-------------------------|-------------------------------------------------|-----------------------------------------|----------------------|
| 1      | Node.js v22.14.0      | 14 694 ± 0.91%          | 229.59 ± 0.91%                                  | ~7.84                                   | 266.20 ± 4.31%       |
| 2      | Browser Chrome v133.0 | 12 479 ± 0.59%          | 194.98 ± 0.59%                                  | ~9.23                                   | -                    |
| 3      | Node.js v16.20.2      | 10 845 ± 0.64%          | 169.45 ± 0.64%                                  | ~10.62                                  | 242.04 ± 5.49%       |
| 4      | Browser Safari v18.3  | 9 794 ± 0.86%           | 153.03 ± 0.86%                                  | ~11.76                                  | -                    |
| 5      | Browser Firefox v139  | 5 546 ± 0.62%           | 86.66 ± 0.62%                                   | ~20.77                                  | -                    |

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

This project is licensed under the [MIT](./LICENSE) License.

## Acknowledgements

This project was inspired by and built upon the work of the following repositories:

- [dotabuff/manta](https://github.com/dotabuff/manta) - Dotabuff's Dota 2 replay parser in Go.
- [saul/demofile-net](https://github.com/saul/demofile-net) - CS2 / Deadlock replay parser in C#.

Huge thanks to their authors and contributors!
