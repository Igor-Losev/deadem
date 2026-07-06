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

**@deademx/cs2** is the Counter-Strike 2 (Source 2) demo parser and replay player for Node.js, Deno, Bun, and browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md).

The [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md) covers the shared model — how to subscribe to data, use interceptors, configure the parser. This document covers Counter-Strike 2-specific details only.

Sibling packages: [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README2.md) (Deadlock) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README2.md) (Dota 2).

## Contents

- [Installation](#installation)<br/>
  Install from npm or use the browser bundle.
- [Quick Start](#quick-start)<br/>
  Parse a replay, print stats.
- [What CS2 Adds](#what-cs2-adds)<br/>
  Everything the package registers on top of the engine.
  - [Message Types](#message-types)<br/>
    CS2-specific message types.
  - [String Tables](#string-tables)<br/>
    CS2-specific string tables.
  - [Decoders](#decoders)<br/>
    CS2-specific entity field decoders.
- [Examples](#examples)<br/>
  Runnable scripts: parsing, player.
- [Compatibility](#compatibility)<br/>
  Game builds and runtimes.
- [Performance](#performance)<br/>
  Measured throughput and memory usage.
- [License](#license)<br/>
  MIT.

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

## Quick Start

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/cs2';

const parser = new Parser();
const readable = createReadStream('./match.dem');

await parser.parse(readable);

const printer = new Printer(parser);

printer.printStats();

await parser.dispose(); // cleanup state and resources
```

## What CS2 Adds

[`Bootstrap`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/src/bootstrap/Bootstrap.js) registers the Counter-Strike 2 schema onto the engine registry:

### Message Types

CS2-specific [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/src/data/enums/MessagePacketType.js)s — round lifecycle, player stats, damage.

### String Tables

CS2-specific [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/src/data/enums/StringTableType.js)s.

| Table | Entries | Content |
| --- | --- | --- |
| `StringTableType.SERVER_AVATAR_OVERRIDES` | ~dozen | Player avatar image overrides |

### Decoders

CS2-specific entity field decoders. Entity examples: `CCSPlayerController`, `CCSGameRulesProxy`. Entities, fields and types can be browsed in [Deadem Explorer](https://deadem.com).

## Examples

All example scripts live in the [`examples-node-cs2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-cs2) package. They look for demo files in `/demos`; missing files are downloaded automatically from [deadem.com](https://deadem.com).

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

## Compatibility

- **Game builds:** tested with Counter-Strike 2 demos from version `1.41.6.0`.
- **Runtimes:** Node.js v18+, Deno, Bun; browsers: Chrome, Firefox, Safari, Edge.

## Performance

| # | Configuration                                                  | Ticks/sec       | 30-min replay, sec | Max Heap, MB | Max ArrayBuffers, MB | Max RSS, MB  |
| - | ---                                                            | ---             | ---                | ---          | ---                  | ---          |
| 1 | No filters (`ParserConfiguration.DEFAULT`)                     | 24 165 +- 0.88% | ~4.77              | 38 +- 4.99%  | 21 +- 18.99%         | 209 +- 5.59% |
| 2 | `messagePacketTypes` allowlist excluding `SVC_PACKET_ENTITIES` | 71 858 +- 1.40% | ~1.60              | 27 +- 6.44%  | 37 +- 7.55%          | 239 +- 7.29% |
| 3 | `entityClasses` allowlist                                      | 54 103 +- 2.37% | ~2.13              | 30 +- 9.73%  | 26 +- 2.66%          | 241 +- 6.35% |

Runtime: Node.js v22.14.0.

See [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md#performance) for optimization tips.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
