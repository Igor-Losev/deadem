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

**deadem** is a Deadlock (Source 2) demo parser and replay player for Node.js and modern browsers, built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, configuration, and the full API surface, see the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This document covers Deadlock-specific usage only.

## Contents

- [Installation](#installation)<br/>
  Install for Node.js or use the browser bundle.
- [Quick start](#quick-start)<br/>
  Minimal example to parse a Deadlock demo file.
- [Examples](#examples)<br/>
  Runnable example scripts covering parsing, player, and broadcast.
- [Usage](#usage)<br/>
  Deadlock-specific usage patterns.
  - [Replay file](#replay-file)<br/>
    Parse a Deadlock replay from a `.dem` file.
  - [HTTP broadcast](#http-broadcast)<br/>
    Parse a live Deadlock HTTP broadcast stream.
  - [Data extraction](#data-extraction)<br/>
    Extract chat messages and query Deadlock entities.
  - [Playback and seeking](#playback-and-seeking)<br/>
    Inspect Deadlock state at a specific tick.
- [Compatibility](#compatibility)<br/>
  Supported game builds and runtimes.
- [Performance](#performance)<br/>
  Measured throughput and memory usage.
- [License](#license)<br/>
  Project licensing information.

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
<script src="//cdn.jsdelivr.net/npm/deadem@2.X.X/dist/deadem.min.js"></script>
```

```js
const { Parser, Player } = window.deadem;
```

## Quick start

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from 'deadem';

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

`Parser` and `Player` in `deadem` are drop-in subclasses of the engine classes — the schema registry is built automatically, so no extra wiring is required.

## Examples

All example scripts live in the [`examples-node-deadem`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-deadem) package. They look for demo files in `/demos`; missing files are downloaded automatically from the public S3 bucket.

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

### Browser

| # | Description | Command |
| --- | --- | --- |
| 01 | Deadem Explorer | `npm start` |

## Usage

### Replay file

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from 'deadem';

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(createReadStream(PATH_TO_DEM_FILE));
await parser.dispose();

printer.printStats();
```

### HTTP broadcast

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser } from 'deadem';

const FROM_BEGINNING = false;
const MATCH_ID = '75637129_201673668';

const gateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const agent = new BroadcastAgent(gateway, MATCH_ID);

const parser = new Parser();

await parser.parse(agent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);
await parser.dispose();
```

### Data extraction

Deadlock-specific message types are exposed via the extended [`MessagePacketType`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/src/data/enums/MessagePacketType.js) — for example, `CITADEL_USER_MESSAGE_CHAT_MESSAGE`, `CITADEL_USER_MESSAGE_HERO_KILLED`, `CITADEL_USER_MESSAGE_BOSS_KILLED`, `CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED`, and more.

Extract chat messages paired with player names from the `USER_INFO` string table:

```js
import { InterceptorStage, MessagePacketType, Parser, StringTableType } from 'deadem';

const parser = new Parser();
const players = new Map();

parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
    if (players.size === 0 && !demoPacket.getIsInitial()) {
        const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

        for (const entry of userInfo.getEntries()) {
            if (Number.isInteger(entry.value.userid)) {
                players.set(entry.value.userid, entry.value.name);
            }
        }
    }
});

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE) {
        console.log(`${players.get(messagePacket.data.playerSlot)}: ${messagePacket.data.text}`);
    }
});

await parser.parse(readable);
```

Query entities after the parse completes:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const controllers = demo.getEntitiesByClassName('CCitadelPlayerController');

const topDamageDealer = controllers.reduce((top, entity) => {
    const data = entity.unpackFlattened();

    return data.m_iHeroDamage > top.damage
        ? { player: data.m_iszPlayerName, damage: data.m_iHeroDamage }
        : top;
}, { player: null, damage: 0 });

console.log(`Top damage dealer: ${topDamageDealer.player} (${topDamageDealer.damage})`);
```

### Playback and seeking

```js
import { createReadStream } from 'node:fs';

import { Player } from 'deadem';

const player = new Player();

await player.load(createReadStream(PATH_TO_DEM_FILE));
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();

demo.getEntitiesByClassName('CCitadelPlayerController').forEach((entity) => {
    const data = entity.unpackFlattened();

    console.log(`${data.m_iszPlayerName}: ${data.m_iHeroDamage} hero damage`);
});

await player.dispose();
```

## Compatibility

- **Game builds:** tested with Deadlock demos from build `6448` and below.
- **Node.js:** v18.0.0 and above.
- **Browsers:** latest Chrome, Firefox, Safari, Edge.

## Performance

Entities are parsed but not unpacked by default. Parser throughput scales with how often `entity.unpackFlattened()` is called. See the [engine performance notes](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance) for how configuration choices affect throughput in general.

All measurements below were taken on a MacBook Pro (M3) without any `entity.unpackFlattened()` calls.

### Single-threaded (`parserThreads = 0`)

| # | Runtime | Ticks/sec | Game seconds/sec (tick rate 64) | 30-min replay, sec | Max memory, MB |
| --- | --- | --- | --- | --- | --- |
| 1 | Node.js v22.14.0 | 8 542 ± 1.30% | 133.47 ± 1.30% | ~13.53 | 329 ± 6.21% |
| 2 | Chrome v133.0 | 7 650 ± 0.59% | 119.53 ± 0.59% | ~15.06 | — |
| 3 | Node.js v16.20.2 | 5 405 ± 0.61% | 84.45 ± 0.26% | ~21.31 | 270 ± 6.98% |
| 4 | Safari v18.3 | 5 295 ± 1.27% | 82.73 ± 1.27% | ~21.76 | — |

### Multi-threaded (`parserThreads = 3`)

| # | Runtime | Ticks/sec | Game seconds/sec (tick rate 64) | 30-min replay, sec | Max memory, MB | Gain vs 0 threads |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Node.js v22.14.0 | 11 292 ± 0.26% | 176.44 ± 0.26% | ~10.20 | 639.16 ± 4.94% | +32.19% |
| 2 | Chrome v133.0 | 9 560 ± 0.43% | 149.38 ± 0.43% | ~12.05 | — | +24.97% |
| 3 | Node.js v16.20.2 | 8 696 ± 0.26% | 135.86 ± 0.26% | ~13.25 | 497.86 ± 6.57% | +60.89% |
| 4 | Safari v18.3 | 7 073 ± 0.44% | 110.52 ± 0.44% | ~16.29 | — | +33.58% |

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.
