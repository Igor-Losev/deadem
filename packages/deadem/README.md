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

**deadem** is the original Deadlock implementation built on top of [`@deadem/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, and engine configuration, see the [`@deadem/engine` documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

## Installation

### Node.js

```shell
npm install deadem --save
```

```js
import { Parser } from 'deadem';
```

### Browser

```html
<script src="//cdn.jsdelivr.net/npm/deadem@2.X.X/dist/deadem.min.js"></script>
```

```js
const { Parser } = window.deadem;
```

## Examples

### Node.js

The example scripts look for demo files in `/demos`. If a local demo file is missing, the example helpers download it automatically from the public S3 bucket.

#### Parsing

| No. | Description | Link | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/100_parse.js) | `node ./packages/examples-node-deadem/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/101_parse_multiple.js) | `node ./packages/examples-node-deadem/scripts/101_parse_multiple.js --matches="36126255,36127043"` |
| 102 | Parse with selective packet filtering | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/102_parse_selective.js) | `node ./packages/examples-node-deadem/scripts/102_parse_selective.js` |
| 103 | Extract chat messages and chat wheel events | [103_parse_chat.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/103_parse_chat.js) | `node ./packages/examples-node-deadem/scripts/103_parse_chat.js` |
| 104 | Extract kill feed events | [104_parse_kill_feed.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/104_parse_kill_feed.js) | `node ./packages/examples-node-deadem/scripts/104_parse_kill_feed.js` |
| 105 | Extract ability usage events | [105_parse_ability_feed.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/105_parse_ability_feed.js) | `node ./packages/examples-node-deadem/scripts/105_parse_ability_feed.js` |
| 106 | Parse mid boss death events | [106_parse_mid_boss_deaths.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/106_parse_mid_boss_deaths.js) | `node ./packages/examples-node-deadem/scripts/106_parse_mid_boss_deaths.js` |
| 107 | Parse tower destruction events | [107_parse_tower_deaths.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/107_parse_tower_deaths.js) | `node ./packages/examples-node-deadem/scripts/107_parse_tower_deaths.js` |

#### Player

| No. | Description | Link | Command |
| --- | --- | --- | --- |
| 200 | Load and play back a replay file | [200_play.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/200_play.js) | `node ./packages/examples-node-deadem/scripts/200_play.js` |
| 201 | Get game duration from replay | [201_play_game_time.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/201_play_game_time.js) | `node ./packages/examples-node-deadem/scripts/201_play_game_time.js` |
| 202 | Identify the top damage dealer | [202_play_top_damage_dealer.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/202_play_top_damage_dealer.js) | `node ./packages/examples-node-deadem/scripts/202_play_top_damage_dealer.js` |
| 203 | Print the final scoreboard | [203_play_scoreboard.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/203_play_scoreboard.js) | `node ./packages/examples-node-deadem/scripts/203_play_scoreboard.js` |

#### Broadcast

| No. | Description | Link | Command |
| --- | --- | --- | --- |
| 300 | Save HTTP Broadcast data to a file | [300_broadcast_save.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/300_broadcast_save.js) | `node ./packages/examples-node-deadem/scripts/300_broadcast_save.js` |
| 301 | Parse HTTP Broadcast directly from the web endpoint | [301_broadcast_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/301_broadcast_parse.js) | `node ./packages/examples-node-deadem/scripts/301_broadcast_parse.js` |
| 302 | Parse HTTP Broadcast data from a saved file | [302_broadcast_parse_file.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadem/scripts/302_broadcast_parse_file.js) | `node ./packages/examples-node-deadem/scripts/302_broadcast_parse_file.js` |

### Browser

| No. | Description | Command |
| --- | --- | --- |
| 01 | Deadem Explorer | `npm start` |

## Usage

### Demo File

```js
import { createReadStream } from 'node:fs';

import { Parser, Printer } from 'deadem';

const parser = new Parser();
const printer = new Printer(parser);
const readable = createReadStream(PATH_TO_DEM_FILE);

await parser.parse(readable);
await parser.dispose();

printer.printStats();
```

### HTTP Broadcast

```js
import { BroadcastAgent, BroadcastGateway, DemoSource, Parser, Printer } from 'deadem';

const FROM_BEGINNING = false;
const MATCH_ID = '75637129_201673668';

const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID);

const parser = new Parser();
const printer = new Printer(parser);

await parser.parse(broadcastAgent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);
await parser.dispose();

printer.printStats();
```

### Data Extraction

Extract Deadlock chat and chat wheel messages:

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
        console.log(`CHAT_MESSAGE: ${players.get(messagePacket.data.playerSlot)} - ${messagePacket.data.text}`);
    }
});

await parser.parse(readable);
```

Post-parse Deadlock-specific query:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

const topDamageDealer = entities.reduce((accumulator, entity) => {
    const data = entity.unpackFlattened();

    return data.m_iHeroDamage > accumulator.damage
        ? { player: data.m_iszPlayerName, damage: data.m_iHeroDamage }
        : accumulator;
}, { player: null, damage: 0 });

console.log(`Top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
```

### Player

Inspect Deadlock state at a specific tick:

```js
import { createReadStream } from 'node:fs';

import { Player } from 'deadem';

const player = new Player();
const readable = createReadStream(PATH_TO_DEM_FILE);

await player.load(readable);
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();
const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

entities.forEach((entity) => {
    const data = entity.unpackFlattened();
    console.log(`${data.m_iszPlayerName}: ${data.m_iHeroDamage} hero damage`);
});

await player.dispose();
```

## Compatibility

Tested with Deadlock demo files from game build `6448` and below.

- **Node.js:** v18.0.0 and above
- **Browsers:** latest Chrome, Firefox, Safari, and Edge

## Performance

By default, entities are parsed but not unpacked. Parser performance may vary depending on the number of `entity.unpackFlattened()` calls.

The table below shows results without calling `entity.unpackFlattened()` on a MacBook Pro with M3 chip.

### 1. `configuration.parserThreads = 0`

| # | Runtime | Speed, ticks per second | Speed, game seconds per second (tick rate 64) | Time to parse a 30-minute game, seconds | Max memory usage, MB |
| --- | --- | --- | --- | --- | --- |
| 1 | Node.js v22.14.0 | 8 542 +- 1.30% | 133.47 +- 1.30% | ~13.53 | 329 +- 6.21% |
| 2 | Browser Chrome v133.0 | 7 650 +- 0.59% | 119.53 +- 0.59% | ~15.06 | - |
| 3 | Node.js v16.20.2 | 5 405 +- 0.61% | 84.45 +- 0.26% | ~21.31 | 270 +- 6.98% |
| 4 | Browser Safari v18.3 | 5 295 +- 1.27% | 82.73 +- 1.27% | ~21.76 | - |

### 2. `configuration.parserThreads = 3`

| # | Runtime | Speed, ticks per second | Speed, game seconds per second (tick rate 64) | Time to parse a 30-minute game, seconds | Max memory usage, MB | Gain vs 0 threads, % |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Node.js v22.14.0 | 11 292 +- 0.26% | 176.44 +- 0.26% | ~10.20 | 639.16 +- 4.94% | 32.19 |
| 2 | Browser Chrome v133.0 | 9 560 +- 0.43% | 149.38 +- 0.43% | ~12.05 | - | 24.97 |
| 3 | Node.js v16.20.2 | 8 696 +- 0.26% | 135.86 +- 0.26% | ~13.25 | 497.86 +- 6.57% | 60.89 |
| 4 | Browser Safari v18.3 | 7 073 +- 0.44% | 110.52 +- 0.44% | ~16.29 | - | 33.58 |

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.

## Acknowledgements

This project was inspired by and built upon the work of the following repositories:

- [dotabuff/manta](https://github.com/dotabuff/manta) - Dotabuff's Dota 2 replay parser in Go
- [saul/demofile-net](https://github.com/saul/demofile-net) - CS2 / Deadlock replay parser in C#
