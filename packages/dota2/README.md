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

**@deademx/dota2** is the Dota 2 (Source 2) demo parser and replay player for Node.js, Deno, Bun, and browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

The [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md) covers the shared model — how to subscribe to data, use interceptors, configure the parser. This document covers Dota 2-specific details only.

Sibling packages: [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md) (Deadlock) and [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md) (Counter-Strike 2).

## Contents

- [Installation](#installation)<br/>
  Install from npm or use the browser bundle.
- [Quick Start](#quick-start)<br/>
  Parse a replay, print stats.
- [What Dota 2 Adds](#what-dota-2-adds)<br/>
  Everything the package registers on top of the engine.
  - [Message Types](#message-types)<br/>
    Dota 2-specific message types.
  - [String Tables](#string-tables)<br/>
    Dota 2-specific string tables.
  - [Decoders](#decoders)<br/>
    Dota 2-specific entity field decoders.
- [Examples](#examples)<br/>
  Runnable scripts: parsing, player.
- [Compatibility](#compatibility)<br/>
  Game patch and runtimes.
- [Performance](#performance)<br/>
  Measured throughput and memory usage.
- [License](#license)<br/>
  MIT.

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
<script src="//cdn.jsdelivr.net/npm/@deademx/dota2@3.X.X/dist/deadem-dota2.min.js"></script>
```

```js
const { Parser, Player } = window.deademDota2;
```

## Quick Start

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from '@deademx/dota2';

const parser = new Parser();
const readable = createReadStream('./match.dem');

await parser.parse(readable);

const printer = new Printer(parser);

printer.printStats();

await parser.dispose(); // cleanup state and resources
```

## What Dota 2 Adds

[`Bootstrap`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/bootstrap/Bootstrap.js) registers the Dota 2 schema onto the engine registry:

### Message Types

Dota 2-specific [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/data/enums/MessagePacketType.js)s — chat, objectives, economy.

### String Tables

Dota 2-specific [`StringTableType`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/src/data/enums/StringTableType.js)s.

| Table | Entries | Content |
| --- | --- | --- |
| `StringTableType.ACTIVE_MODIFIERS` | hundreds | Every buff/debuff on every entity. Decoded into `CDOTAModifierBuffTableEntry` lazily on first `entry.value` read. |
| `StringTableType.COMBAT_LOG_NAMES` | hundreds | Resolves combat log entity/ability/item ids to names. |
| `StringTableType.COOLDOWN_NAMES` | hundreds | Resolves ability cooldown ids to names. |
| `StringTableType.DOWNLOADABLES` | hundreds | — |
| `StringTableType.ECON_ITEMS` | hundreds | Equipped cosmetic items. |
| `StringTableType.LUA_MODIFIERS` | hundreds | — |
| `StringTableType.MODIFIER_NAMES` | thousands | Resolves `ActiveModifiers.modifierClass` to readable names. |
| `StringTableType.PARTICLE_ASSETS` | hundreds | — |
| `StringTableType.RESPONSE_KEYS` | hundreds | — |

### Decoders

Dota 2-specific entity field decoders. Entity examples: `CDOTAPlayerController`, `CDOTAGameRulesProxy`. Entities, fields and types can be browsed in [Deadem Explorer](https://deadem.com).

## Examples

All example scripts live in the [`examples-node-dota2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-dota2) package. They look for demo files in `/demos`; missing files are downloaded automatically from [deadem.com](https://deadem.com).

### Parsing

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js) | `node ./packages/examples-node-dota2/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/101_parse_multiple.js) | `node ./packages/examples-node-dota2/scripts/101_parse_multiple.js --matches="8773493455,8777738576"` |
| 102 | Parse selected message types | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/102_parse_selective.js) | `node ./packages/examples-node-dota2/scripts/102_parse_selective.js` |
| 103 | Print chat messages | [103_parse_chat.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/103_parse_chat.js) | `node ./packages/examples-node-dota2/scripts/103_parse_chat.js` |
| 104 | Rank high-churn entity classes and fields from `ENTITY_PACKET` deltas | [104_parse_entity_field_stats.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/104_parse_entity_field_stats.js) | `node ./packages/examples-node-dota2/scripts/104_parse_entity_field_stats.js` |
| 110 | Print the combat log, names resolved through `CombatLogNames` | [110_parse_combat_log.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/110_parse_combat_log.js) | `node ./packages/examples-node-dota2/scripts/110_parse_combat_log.js` |

### Player

| # | Description | Source | Command |
| --- | --- | --- | --- |
| 200 | Load, seek, play, and pause a replay | [200_play.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/200_play.js) | `node ./packages/examples-node-dota2/scripts/200_play.js` |

## Compatibility

- **Game patch:** tested with Dota 2 demos from patch `7.41b` and below.
- **Runtimes:** Node.js v18+, Deno, Bun; browsers: Chrome, Firefox, Safari, Edge.

## Performance

| # | Configuration                                                  | Ticks/sec        | 30-min replay, sec | Max Heap, MB  | Max ArrayBuffers, MB | Max RSS, MB  |
| - | ---                                                            | ---              | ---                | ---           | ---                  | ---          |
| 1 | No filters (`ParserConfiguration.DEFAULT`)                     | 25 464 +- 3.63%  | ~2.12              | 104 +- 18.28% | 48 +- 28.16%         | 330 +- 0.92% |
| 2 | `messagePacketTypes` allowlist excluding `SVC_PACKET_ENTITIES` | 168 743 +- 3.21% | ~0.32              | 39 +- 6.07%   | 22 +- 13.72%         | 232 +- 6.87% |
| 3 | `entityClasses` allowlist                                      | 89 779 +- 0.75%  | ~0.60              | 75 +- 23.59%  | 17 +- 20.27%         | 250 +- 2.96% |

Runtime: Node.js v22.14.0.

See [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance) for optimization tips.

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
