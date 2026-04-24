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

**@deademx/dota2** is a Dota 2 (Source 2) demo parser and replay player for Node.js and modern browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, configuration, and the full API surface, see the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This document covers Dota 2-specific usage only.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Examples](#examples)
- [Usage](#usage)
  - [Replay file](#replay-file)
  - [Data extraction](#data-extraction)
  - [Playback and seeking](#playback-and-seeking)
- [Compatibility](#compatibility)
- [Performance](#performance)
- [License](#license)
- [Acknowledgements](#acknowledgements)

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

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js) | `node ./packages/examples-node-dota2/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/101_parse_multiple.js) | `node ./packages/examples-node-dota2/scripts/101_parse_multiple.js --matches="8773493455,8777738576"` |
| 102 | Parse selected message types | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/102_parse_selective.js) | `node ./packages/examples-node-dota2/scripts/102_parse_selective.js` |

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

Dota 2-specific message types are exposed via the extended `MessagePacketType` — for example, `DOTA_UM_CHAT_MESSAGE`, `DOTA_UM_CHAT_EVENT`, `DOTA_UM_OVERHEAD_EVENT`, `DOTA_UM_COMBAT_LOG_DATA_HLTV`, and more. Dota 2-specific string tables (`MODIFIER_NAMES`, `COMBAT_LOG_NAMES`, `ECON_ITEMS`, …) are exposed via the extended `StringTableType`.

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

- **Node.js:** v18.0.0 and above.
- **Browsers:** latest Chrome, Firefox, Safari, Edge.

## Performance

Performance depends on the replay, selected packet filters, and how often entity data is unpacked.

| Scenario | Expected impact | Notes |
| --- | --- | --- |
| Parse all packet types | Highest coverage, higher CPU and memory cost | Use when you need complete replay state |
| Filter `MessagePacketType` via `ParserConfiguration` | Lower parse cost | Useful for chat-only or event-focused extraction |
| Call `entity.unpackFlattened()` frequently | Higher per-entity overhead | Prefer targeted reads over unpacking every entity |
| Keep `parserThreads = 0` | Lowest coordination overhead | Good default for smaller workloads and browser usage |

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.

## Acknowledgements

Inspired by and built upon the work of:

- [dotabuff/manta](https://github.com/dotabuff/manta) — Dotabuff's Dota 2 replay parser in Go
- [saul/demofile-net](https://github.com/saul/demofile-net) — CS2 / Deadlock replay parser in C#
