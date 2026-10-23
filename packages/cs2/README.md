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
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Counter--Strike%202-1.41.8.9-darkGreen" /></a>

**@deademx/cs2** is a Counter-Strike 2 demo parser and replay player for Node.js, Deno, Bun and browsers.

The model and the API are described in the [`@deademx/engine` documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This page covers Counter-Strike 2: where its data lives, examples and performance.

Other games: [`deadem`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadem/README.md) for Deadlock and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md) for Dota 2.

## Contents

- [Installation](#installation)<br/>
  From npm or as a browser bundle.
- [Quick Start](#quick-start)<br/>
  The scoreboard of a match.
- [Where to Find](#where-to-find)<br/>
  Counter-Strike 2 data and its source.
- [Examples](#examples)<br/>
  Runnable scripts.
- [Compatibility](#compatibility)<br/>
  Game builds and runtimes.
- [Performance](#performance)<br/>
  Speed and memory.
- [License](#license)<br/>
  MIT.

## Installation

### npm

```shell
npm install @deademx/cs2 --save
```

```js
import { Parser, Player } from '@deademx/cs2';
```

The same import works in Node.js, Bun and in a browser app built with a bundler such as Vite or webpack.

### CDN

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/cs2@5.X.X/dist/deadem-cs2.min.js"></script>
```

```js
const { Parser, Player } = window.deademCs2;
```

## Quick Start

```js
import { createReadStream } from 'node:fs';

import { Parser } from '@deademx/cs2';

const parser = new Parser();

await parser.parse(createReadStream('./match.dem'));

for (const controller of parser.getDemo().getEntitiesByClassName('CCSPlayerController')) {
    if (controller.getField('m_iTeamNum') < 2) continue; // spectators and SourceTV

    const name = controller.getField('m_iszPlayerName');
    const kills = controller.getField('m_pActionTrackingServices.m_matchStats.m_iKills');
    const deaths = controller.getField('m_pActionTrackingServices.m_matchStats.m_iDeaths');
    const assists = controller.getField('m_pActionTrackingServices.m_matchStats.m_iAssists');
    const mvps = controller.getField('m_iMVPs');

    console.log(`${name}: ${kills}/${deaths}/${assists}, ${mvps} MVPs`);
}

await parser.dispose();
```

## Where to Find

The table lists the most common data. [Deadem Explorer](https://deadem.com) shows every entity with its fields and their types.

| Data | Kind | Source |
| --- | --- | --- |
| Player name, team and Steam ID | Entity | `CCSPlayerController`: `m_iszPlayerName`, `m_iTeamNum`, `m_steamID` |
| Kills, deaths, assists and damage | Entity | `CCSPlayerController`, under `m_pActionTrackingServices.m_matchStats`: `m_iKills`, `m_iDeaths`, `m_iAssists`, `m_iDamage` |
| Score, MVPs and money | Entity | `CCSPlayerController`: `m_iScore`, `m_iMVPs`, `m_pInGameMoneyServices.m_iAccount` |
| Player health and armor | Entity | `CCSPlayerPawn`: `m_iHealth`, `m_ArmorValue` |
| Player position | Entity | `CCSPlayerPawn`, under `CBodyComponent.m_skeletonInstance.m_vecOrigin`: a cell and an offset in it per axis, `m_cellX` and `m_vecX` |
| Pawn of a player | Entity | `m_hPlayerPawn` on the controller. `m_hController` on the pawn can be empty while the player is dead |
| Active weapon | Entity | `m_pWeaponServices.m_hActiveWeapon` on the pawn, for example `CAK47` or `CWeaponAWP` |
| Rounds, warmup and bomb | Entity | `CCSGameRulesProxy`, under `m_pGameRules`: `m_totalRoundsPlayed`, `m_bWarmupPeriod`, `m_bFreezePeriod`, `m_bBombPlanted` |
| Team names and score | Entity | `CCSTeam`: `m_iTeamNum`, `m_szClanTeamname`, `m_iScore` |
| Kills, damage, bomb and other game events | Message | `GE_SOURCE1_LEGACY_GAME_EVENT`, for example `player_death` with `userid`, `attacker`, `weapon`, `headshot` |
| Chat | Message | `USER_MESSAGE_SAY_TEXT_2`, as in [`105_parse_chat.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/105_parse_chat.js) |
| Player info | String table | `StringTableType.USER_INFO`: `name`, `steamid` |
| Player input | User command | `command.state`: `base.viewangles`, `inputHistory` |

Field prefixes:

- `m_h*` holds a handle for `demo.getEntityByHandle()`.

## Examples

The scripts live in [`examples-node-cs2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-cs2/scripts). A script runs with `node ./packages/examples-node-cs2/scripts/<file>`. Missing demos are downloaded from [deadem.com](https://deadem.com), and scripts that read a demo accept `--demo=<path>`.

Parser:

- [`100_parse.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/100_parse.js): parse a single replay.
- [`101_parse_multiple.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/101_parse_multiple.js): parse several replays, for example `--matches="2026-05-15-natus-vincere-vs-vitality-m1-dust2,2026-05-15-natus-vincere-vs-vitality-m2-anubis"`.
- [`102_parse_selective.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/102_parse_selective.js): parse with filters.
- [`103_parse_damage.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/103_parse_damage.js): damage by attacker from `player_hurt` events.
- [`104_parse_entity_field_stats.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/104_parse_entity_field_stats.js): the entity classes and fields that change most often.
- [`105_parse_chat.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/105_parse_chat.js): chat messages by channel.
- [`106_parse_kill_feed.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/106_parse_kill_feed.js): the kill feed with weapons, headshots and distance.
- [`107_parse_bomb_timeline.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/107_parse_bomb_timeline.js): bomb pickups, drops, plants, defuses and explosions.
- [`108_parse_match_summary.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/108_parse_match_summary.js): the match scoreboard and end-of-match awards.
- [`109_parse_input_activity.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/109_parse_input_activity.js): the user command fields that change most often.

Player:

- [`200_play.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/200_play.js): load, seek, play and pause a replay.

## Compatibility

- **Game builds:** Counter-Strike 2 demos from version `1.41.8.9` and below.
- **Runtimes:** Node.js 18 and later, Deno, Bun, and Chrome, Firefox, Safari and Edge.

## Performance

| Configuration | Ticks/sec | MB/sec | 30-min replay, sec | Max RSS, MB |
| --- | --- | --- | --- | --- |
| Everything | 30 600 | 58 | ~3.76 | 161 |
| Chat only | 113 229 | 216 | ~1.02 | 196 |
| Player controllers only | 84 756 | 161 | ~1.36 | 196 |
| User commands only | 53 963 | 103 | ~2.13 | 145 |

```js
// Everything
ParserConfiguration.DEFAULT

// Chat only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.USER_MESSAGE_SAY_TEXT_2 ] })

// Player controllers only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ], entityClasses: [ 'CCSPlayerController' ] })

// User commands only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.SVC_USER_COMMANDS ] })
```

Measured with [`000_benchmark.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-cs2/scripts/000_benchmark.js) on Node.js v22.14.0. Filters and speed tips are in the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance).

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
