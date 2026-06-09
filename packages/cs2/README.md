<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deademx/cs2
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/cs2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fcs2" /></a>
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Counter--Strike%202-1.41.6.0-darkGreen" /></a>

**@deademx/cs2** is a Counter-Strike 2 (Source 2) demo parser and replay player for Node.js and modern browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, configuration, and the full API surface, see the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This document covers Counter-Strike 2-specific usage only.

Other game implementations: [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md) (Deadlock) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md) (Dota 2).

## Contents

- [Installation](#installation)<br/>
  Install for Node.js or use the browser bundle.
- [Quick start](#quick-start)<br/>
  Minimal example to parse a Counter-Strike 2 demo file.
- [Examples](#examples)<br/>
  Runnable example scripts covering parsing, player, and browser.
- [Usage](#usage)<br/>
  Counter-Strike 2-specific usage patterns.
  - [Replay file](#replay-file)<br/>
    Parse a Counter-Strike 2 replay from a `.dem` file.
  - [Data extraction](#data-extraction)<br/>
    Extract Counter-Strike 2 chat, kills, and damage.
  - [Playback and seeking](#playback-and-seeking)<br/>
    Inspect Counter-Strike 2 state at a specific tick.
- [Compatibility](#compatibility)<br/>
  Supported runtimes.
- [Performance](#performance)<br/>
  Measured throughput benchmarks.
- [License](#license)<br/>
  Project licensing information.

## Installation

### Node.js

```shell
npm install @deademx/cs2 --save
```

```js
import { Parser, Player } from '@deademx/cs2';
```

### Browser

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/cs2@3.X.X/dist/deadem-cs2.min.js"></script>
```

```js
const { Parser, Player } = window.deademCs2;
```

## Quick start

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/cs2';

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

`Parser` and `Player` in `@deademx/cs2` are drop-in subclasses of the engine classes — the schema registry is built automatically, so no extra wiring is required.

## Examples

All example scripts live in the [`examples-node-cs2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-cs2) package. They look for demo files in `/demos`; missing files are downloaded automatically from the public S3 bucket.

### Parsing

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/100_parse.js) | `node ./packages/examples-node-cs2/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/101_parse_multiple.js) | `node ./packages/examples-node-cs2/scripts/101_parse_multiple.js --matches="2026-05-15-natus-vincere-vs-vitality-m1-dust2,2026-05-15-natus-vincere-vs-vitality-m2-anubis"` |
| 102 | Parse selected message types | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/102_parse_selective.js) | `node ./packages/examples-node-cs2/scripts/102_parse_selective.js` |
| 103 | Aggregate damage by attacker from `player_hurt` events | [103_parse_damage.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/103_parse_damage.js) | `node ./packages/examples-node-cs2/scripts/103_parse_damage.js` |
| 104 | Rank high-churn entity classes and fields from `ENTITY_PACKET` deltas | [104_parse_entity_field_stats.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/104_parse_entity_field_stats.js) | `node ./packages/examples-node-cs2/scripts/104_parse_entity_field_stats.js` |
| 105 | Print chat messages by channel (ALL / CT / T / DEAD / SPEC) | [105_parse_chat.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/105_parse_chat.js) | `node ./packages/examples-node-cs2/scripts/105_parse_chat.js` |
| 106 | Print kill feed with weapon, headshot, distance, and flags | [106_parse_kill_feed.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/106_parse_kill_feed.js) | `node ./packages/examples-node-cs2/scripts/106_parse_kill_feed.js` |
| 107 | Print bomb timeline (pickup / drop / plant / defuse / explode) | [107_parse_bomb_timeline.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/107_parse_bomb_timeline.js) | `node ./packages/examples-node-cs2/scripts/107_parse_bomb_timeline.js` |
| 108 | Aggregate match scoreboard (K/D/A/HS%) and match-end accolades | [108_parse_match_summary.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/108_parse_match_summary.js) | `node ./packages/examples-node-cs2/scripts/108_parse_match_summary.js` |

### Player

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 200 | Load, seek, play, and pause a replay | [200_play.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/200_play.js) | `node ./packages/examples-node-cs2/scripts/200_play.js` |

### Browser

| # | Description | Command |
| --- | --- | --- |
| 01 | Deadem Explorer | `npm start` |

## Usage

### Replay file

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/cs2';

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

### Data extraction

Counter-Strike 2-specific message types are exposed via the extended [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/src/data/enums/MessagePacketType.js) — for example, `CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA`, `CS_UM_PLAYER_STATS_UPDATE`, `GE_FIRE_BULLETS`, `GE_PLAYER_BULLET_HIT`, and more. Counter-Strike 2-specific string tables (`SERVER_AVATAR_OVERRIDES`) are exposed via the extended [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/src/data/enums/StringTableType.js).

Filter and extract chat messages:

```js
import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration } from '@deademx/cs2';

const parser = new Parser(new ParserConfiguration({
    messagePacketTypes: [ MessagePacketType.USER_MESSAGE_SAY_TEXT_2 ]
}));

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.USER_MESSAGE_SAY_TEXT_2) {
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

demo.getEntitiesByClassName('CCSPlayerController').forEach((entity) => {
    console.log(entity.getField('m_iszPlayerName'));
});
```

### Playback and seeking

```js
import { createReadStream } from 'node:fs';

import { Player } from '@deademx/cs2';

const player = new Player();

await player.load(createReadStream(PATH_TO_DEM_FILE));
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();

console.log(`Ticks: ${player.getFirstTick()} → ${player.getLastTick()}`);
console.log(`Entities at last tick: ${demo.getEntities().length}`);

await player.dispose();
```

## Compatibility

- **Game:** tested with Counter-Strike 2 demos from version `1.41.6.0`.
- **Node.js:** v18.0.0 and above.
- **Browsers:** latest Chrome, Firefox, Safari, Edge.

## Performance

For configuration trade-offs see the [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance).

| # | Configuration                                                  | Ticks/sec       | 30-min replay, sec | Max Heap, MB | Max ArrayBuffers, MB | Max RSS, MB  |
| - | ---                                                            | ---             | ---                | ---          | ---                  | ---          |
| 1 | No filters (`ParserConfiguration.DEFAULT`)                     | 24 165 +- 0.88% | ~4.77              | 38 +- 4.99%  | 21 +- 18.99%         | 209 +- 5.59% |
| 2 | `messagePacketTypes` allowlist excluding `SVC_PACKET_ENTITIES` | 71 858 +- 1.40% | ~1.60              | 27 +- 6.44%  | 37 +- 7.55%          | 239 +- 7.29% |
| 3 | `entityClasses` allowlist                                      | 54 103 +- 2.37% | ~2.13              | 30 +- 9.73%  | 26 +- 2.66%          | 241 +- 6.35% |

Runtime: Node.js v22.14.0.

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.
