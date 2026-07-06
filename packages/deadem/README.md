<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
deadem
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/deadem" alt=""><img src="https://img.shields.io/npm/v/deadem" /></a>
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Deadlock%20Game%20Build-6448-darkGreen" /></a>

**deadem** is the Deadlock (Source 2) demo parser and replay player for Node.js, Deno, Bun, and browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md).

The [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md) covers the shared model — how to subscribe to data, use interceptors, configure the parser. This document covers Deadlock-specific details only.

Sibling packages: [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md) (Counter-Strike 2) and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md) (Dota 2).

## Contents

- [Installation](#installation)<br/>
  Install from npm or use the browser bundle.
- [Quick Start](#quick-start)<br/>
  Parse a replay, print stats.
- [What Deadlock Adds](#what-deadlock-adds)<br/>
  Everything the package registers on top of the engine.
  - [Message Types](#message-types)<br/>
    Deadlock-specific message types.
  - [String Tables](#string-tables)<br/>
    Deadlock-specific string tables.
  - [Decoders](#decoders)<br/>
    Deadlock-specific entity field decoders.
- [Examples](#examples)<br/>
  Runnable scripts: parsing, player, broadcast.
- [Compatibility](#compatibility)<br/>
  Game builds and runtimes.
- [Performance](#performance)<br/>
  Measured throughput and memory usage.
- [License](#license)<br/>
  MIT.

## Installation

### Node.js

```shell
npm install deadem --save
```

```js
import { Parser, Player } from 'deadem';
```

### Browser

```html
<script src="//cdn.jsdelivr.net/npm/deadem@3.X.X/dist/deadem.min.js"></script>
```

```js
const { Parser, Player } = window.deadem;
```

## Quick Start

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

## What Deadlock Adds

[`Bootstrap`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/src/bootstrap/Bootstrap.js) registers the Deadlock schema onto the engine registry:

### Message Types

Deadlock-specific [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/src/data/enums/MessagePacketType.js)s — kills, objectives, chat, etc.

### String Tables

Deadlock-specific [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/src/data/enums/StringTableType.js)s.

| Table | Entries | Content |
| --- | --- | --- |
| `StringTableType.ACTIVE_MODIFIERS` | hundreds | Every buff/debuff on every entity. Decoded into [`CModifierTableEntry`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/proto/source/base_modifier.proto) lazily on first `entry.value` read. Updated on roughly two thirds of all ticks. |

### Decoders

Deadlock-specific entity field decoders. Entity examples: `CCitadelPlayerController`, `CCitadelPlayerPawn`, `CCitadelGameRulesProxy`. Entities, fields and types can be browsed in [Deadem Explorer](https://deadem.com).

## Examples

All example scripts live in the [`examples-node-deadem`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-deadem) package. They look for demo files in `/demos`; missing files are downloaded automatically from [deadem.com](https://deadem.com).

### Parsing

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/100_parse.js) | `node ./packages/examples-node-deadem/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/101_parse_multiple.js) | `node ./packages/examples-node-deadem/scripts/101_parse_multiple.js --matches="36126255,36127043"` |
| 102 | Parse with selective packet filtering | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/102_parse_selective.js) | `node ./packages/examples-node-deadem/scripts/102_parse_selective.js` |
| 103 | Extract chat messages and chat wheel events | [103_parse_chat.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/103_parse_chat.js) | `node ./packages/examples-node-deadem/scripts/103_parse_chat.js` |
| 104 | Extract kill feed events | [104_parse_kill_feed.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/104_parse_kill_feed.js) | `node ./packages/examples-node-deadem/scripts/104_parse_kill_feed.js` |
| 105 | Extract ability usage events | [105_parse_ability_feed.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/105_parse_ability_feed.js) | `node ./packages/examples-node-deadem/scripts/105_parse_ability_feed.js` |
| 106 | Parse mid boss spawn and kill events | [106_parse_mid_boss_deaths.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/106_parse_mid_boss_deaths.js) | `node ./packages/examples-node-deadem/scripts/106_parse_mid_boss_deaths.js` |
| 107 | Parse tower destruction events | [107_parse_tower_deaths.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/107_parse_tower_deaths.js) | `node ./packages/examples-node-deadem/scripts/107_parse_tower_deaths.js` |
| 108 | Rank high-churn entity classes and fields from `ENTITY_PACKET` deltas | [108_parse_entity_field_stats.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/108_parse_entity_field_stats.js) | `node ./packages/examples-node-deadem/scripts/108_parse_entity_field_stats.js` |

### Player

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 200 | Load and play back a replay file | [200_play.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/200_play.js) | `node ./packages/examples-node-deadem/scripts/200_play.js` |
| 201 | Get game duration from replay | [201_play_game_time.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/201_play_game_time.js) | `node ./packages/examples-node-deadem/scripts/201_play_game_time.js` |
| 202 | Identify the top damage dealer | [202_play_top_damage_dealer.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/202_play_top_damage_dealer.js) | `node ./packages/examples-node-deadem/scripts/202_play_top_damage_dealer.js` |
| 203 | Print the final scoreboard | [203_play_scoreboard.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/203_play_scoreboard.js) | `node ./packages/examples-node-deadem/scripts/203_play_scoreboard.js` |

### Broadcast

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 300 | Save HTTP Broadcast data to a file | [300_broadcast_save.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/300_broadcast_save.js) | `node ./packages/examples-node-deadem/scripts/300_broadcast_save.js` |
| 301 | Parse HTTP Broadcast live | [301_broadcast_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/301_broadcast_parse.js) | `node ./packages/examples-node-deadem/scripts/301_broadcast_parse.js` |
| 302 | Parse HTTP Broadcast data from a saved file | [302_broadcast_parse_file.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/302_broadcast_parse_file.js) | `node ./packages/examples-node-deadem/scripts/302_broadcast_parse_file.js` |

## Compatibility

- **Game builds:** tested with Deadlock demos from build `6448` and below.
- **Runtimes:** Node.js v18+, Deno, Bun; browsers: Chrome, Firefox, Safari, Edge.

## Performance

| # | Configuration                                                  | Ticks/sec       | 30-min replay, sec | Max Heap, MB | Max ArrayBuffers, MB | Max RSS, MB  |
| - | ---                                                            | ---             | ---                | ---          | ---                  | ---          |
| 1 | No filters (`ParserConfiguration.DEFAULT`)                     | 12 115 +- 2.80% | ~9.51              | 43 +- 3.65%  | 17 +- 9.48%          | 187 +- 2.74% |
| 2 | `messagePacketTypes` allowlist excluding `SVC_PACKET_ENTITIES` | 73 277 +- 3.41% | ~1.57              | 32 +- 6.58%  | 30 +- 7.74%          | 241 +- 3.38% |
| 3 | `entityClasses` allowlist                                      | 55 834 +- 2.08% | ~2.06              | 45 +- 15.71% | 23 +- 5.53%          | 239 +- 5.09% |

Runtime: Node.js v22.14.0.

See [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README2.md#performance) for optimization tips.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
