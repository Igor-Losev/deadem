<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deademx/dota2
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/dota2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fdota2" /></a>
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Dota%202%20Patch-7.41b-darkGreen" /></a>

**@deademx/dota2** is a Dota 2 (Source 2) demo parser and replay player for Node.js and modern browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, configuration, and the full API surface, see the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This document covers Dota 2-specific usage only.

## Contents

- [Installation](#installation)<br/>
  Install for Node.js or use the browser bundle.
- [Quick start](#quick-start)<br/>
  Minimal example to parse a Dota 2 demo file.
- [Examples](#examples)<br/>
  Runnable example scripts covering parsing and player.
- [Usage](#usage)<br/>
  Dota 2-specific usage patterns.
  - [Replay file](#replay-file)<br/>
    Parse a Dota 2 replay from a `.dem` file.
  - [Data extraction](#data-extraction)<br/>
    Extract Dota 2 chat and query entities.
  - [Playback and seeking](#playback-and-seeking)<br/>
    Inspect Dota 2 state at a specific tick.
- [Compatibility](#compatibility)<br/>
  Supported game patch and runtimes.
- [Performance](#performance)<br/>
  Measured throughput benchmarks.
- [License](#license)<br/>
  Project licensing information.

## Installation

### Node.js

```shell
npm install @deademx/dota2 --save
```

```js
import { Parser, Player } from '@deademx/dota2';
```

### Browser

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/dota2@0.X.X/dist/deadem-dota2.min.js"></script>
```

```js
const { Parser, Player } = window.deademDota2;
```

## Quick start

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/dota2';

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

`Parser` and `Player` in `@deademx/dota2` are drop-in subclasses of the engine classes — the schema registry is built automatically, so no extra wiring is required.

## Examples

All example scripts live in the [`examples-node-dota2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-dota2) package. They look for demo files in `/demos`; missing files are downloaded automatically from the public S3 bucket.

### Parsing

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js) | `node ./packages/examples-node-dota2/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/101_parse_multiple.js) | `node ./packages/examples-node-dota2/scripts/101_parse_multiple.js --matches="8773493455,8777738576"` |
| 102 | Parse selected message types | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/102_parse_selective.js) | `node ./packages/examples-node-dota2/scripts/102_parse_selective.js` |
| 103 | Print Dota 2 chat messages | [103_parse_chat.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/103_parse_chat.js) | `node ./packages/examples-node-dota2/scripts/103_parse_chat.js` |

### Player

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 200 | Load, seek, play, and pause a replay | [200_play.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/200_play.js) | `node ./packages/examples-node-dota2/scripts/200_play.js` |

## Usage

### Replay file

```js
import { createReadStream } from 'node:fs';

import { Parser, ParserConfiguration, Printer } from '@deademx/dota2';

const parser = new Parser(new ParserConfiguration({ parserThreads: 0 }));
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

### Data extraction

Dota 2-specific message types are exposed via the extended [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/data/enums/MessagePacketType.js) — for example, `DOTA_UM_CHAT_MESSAGE`, `DOTA_UM_CHAT_EVENT`, `DOTA_UM_OVERHEAD_EVENT`, `DOTA_UM_COMBAT_LOG_DATA_HLTV`, and more. Dota 2-specific string tables (`MODIFIER_NAMES`, `COMBAT_LOG_NAMES`, `ECON_ITEMS`, …) are exposed via the extended [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/data/enums/StringTableType.js).

Filter and extract chat messages:

```js
import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration } from '@deademx/dota2';

const parser = new Parser(new ParserConfiguration({
    messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ]
}));

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.DOTA_UM_CHAT_MESSAGE) {
        console.log(messagePacket.data);
    }
});

await parser.parse(readable);
await parser.dispose();
```

Query entities and classes after the parse completes:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntities();

console.log(`Total entities at end of demo: ${entities.length}`);
```

### Playback and seeking

```js
import { createReadStream } from 'node:fs';

import { Player } from '@deademx/dota2';

const player = new Player();

await player.load(createReadStream(PATH_TO_DEM_FILE));
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();

console.log(`Ticks: ${player.getFirstTick()} → ${player.getLastTick()}`);
console.log(`Entities at last tick: ${demo.getEntities().length}`);

await player.dispose();
```

## Compatibility

- **Game patch:** tested with Dota 2 demos from patch `7.41b` and below.
- **Node.js:** v18.0.0 and above.
- **Browsers:** latest Chrome, Firefox, Safari, Edge.

## Performance

See the [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance) for how configuration choices affect parser throughput in general.

### Single-threaded (`parserThreads = 0`)

Memory below reports the sampled peak RSS from isolated runs.

| # | Scenario | Runtime | Ticks/sec | Game seconds/sec (tick rate 30) | 30-min replay, sec | Max memory, MB |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | All packet types (entities included) | Node.js v22.14.0 | 16 987 +- 2.14% | 566.25 +- 2.14% | ~3.18 | 390 +- 3.41% |
| 2 | All packet types, `SVC_PACKET_ENTITIES` excluded | Node.js v22.14.0 | 85 042 +- 1.69% | 2 834.74 +- 1.69% | ~0.63 | 213 +- 4.84% |
| 3 | Single `MessagePacketType` only | Node.js v22.14.0 | 126 327 +- 1.57% | 4 210.89 +- 1.57% | ~0.43 | 235 +- 3.34% |

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.
