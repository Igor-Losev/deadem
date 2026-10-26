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
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Dota%202%20Patch-7.41f-darkGreen" /></a>

**@deademx/dota2** is a Dota 2 demo parser and replay player for Node.js, Deno, Bun and browsers.

The model and the API are described in the [`@deademx/engine` documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This page covers Dota 2: where its data lives, examples and performance.

Other games: [`@deademx/deadlock`](https://github.com/Igor-Losev/deadem/blob/main/packages/deadlock/README.md) for Deadlock and [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md) for Counter-Strike 2.

## Contents

- [Installation](#installation)<br/>
  From npm or as a browser bundle.
- [Quick Start](#quick-start)<br/>
  The scoreboard of a match.
- [Where to Find](#where-to-find)<br/>
  Dota 2 data and its source.
- [Examples](#examples)<br/>
  Runnable scripts.
- [Compatibility](#compatibility)<br/>
  Game patches and runtimes.
- [Performance](#performance)<br/>
  Speed and memory.
- [License](#license)<br/>
  MIT.

## Installation

### npm

```shell
npm install @deademx/dota2 --save
```

```js
import { Parser, Player } from '@deademx/dota2';
```

The same import works in Node.js, Bun and in a browser app built with a bundler such as Vite or webpack.

### CDN

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/dota2@5.X.X/dist/deadem-dota2.min.js"></script>
```

```js
const { Parser, Player } = window.deadem.dota2;
```

## Quick Start

```js
import { createReadStream } from 'node:fs';

import { Parser } from '@deademx/dota2';

const parser = new Parser();

await parser.parse(createReadStream('./match.dem'));

const demo = parser.getDemo();
const [ resource ] = demo.getEntitiesByClassName('CDOTA_PlayerResource');

for (const controller of demo.getEntitiesByClassName('CDOTAPlayerController')) {
    if (controller.getField('m_iTeamNum') < 2) continue; // spectators and SourceTV

    const id = String(controller.getField('m_nPlayerID')).padStart(4, '0');
    const name = controller.getField('m_iszPlayerName');
    const hero = demo.getEntityByHandle(controller.getField('m_hAssignedHero'));
    const kills = resource.getField(`m_vecPlayerTeamData.${id}.m_iKills`);
    const deaths = resource.getField(`m_vecPlayerTeamData.${id}.m_iDeaths`);
    const assists = resource.getField(`m_vecPlayerTeamData.${id}.m_iAssists`);

    console.log(`${name} (${hero.class.name}): ${kills}/${deaths}/${assists}`);
}

await parser.dispose();
```

## Where to Find

The table lists the most common data. [Deadem Explorer](https://deadem.com) shows every entity with its fields and their types.

| Data | Kind | Source |
| --- | --- | --- |
| Player name, team, Steam ID and player ID | Entity | `CDOTAPlayerController`: `m_iszPlayerName`, `m_iTeamNum`, `m_steamID`, `m_nPlayerID` |
| Hero of a player | Entity | `m_hAssignedHero` on the controller, a `CDOTA_Unit_Hero_*` entity |
| Kills, deaths, assists, level and hero ID | Entity | `CDOTA_PlayerResource`, under `m_vecPlayerTeamData.N` with the player ID as N: `m_iKills`, `m_iDeaths`, `m_iAssists`, `m_iLevel`, `m_nSelectedHeroID` |
| Net worth, gold, last hits and denies | Entity | `CDOTA_DataRadiant` and `CDOTA_DataDire`, under `m_vecDataTeam.N` with the team slot of the player as N: `m_iNetWorth`, `m_iReliableGold`, `m_iUnreliableGold`, `m_iLastHitCount`, `m_iDenyCount`. The team slot is `m_iTeamSlot` under `m_vecPlayerTeamData.N` of `CDOTA_PlayerResource` |
| Hero health and level | Entity | `CDOTA_Unit_Hero_*`: `m_iHealth`, `m_iMaxHealth`, `m_iCurrentLevel` |
| Hero position | Entity | `CDOTA_Unit_Hero_*`, under `CBodyComponent.m_skeletonInstance.m_vecOrigin`: a cell and an offset in it per axis, `m_cellX` and `m_vecX` |
| Game start, state and pause | Entity | `CDOTAGamerulesProxy`, under `m_pGameRules`: `m_flGameStartTime`, `m_nGameState`, `m_bGamePaused` |
| Combat log | Message | `DOTA_UM_COMBAT_LOG_DATA_HLTV`: `type`, `attackerName`, `targetName`, `value` |
| Chat | Message | `DOTA_UM_CHAT_MESSAGE`: `sourcePlayerId`, `messageText` |
| Player orders | Message | `DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS`: `entindex` of the controller, `orderType`, `targetIndex`, `abilityId` |
| Buffs and debuffs | String table | `StringTableType.ACTIVE_MODIFIERS`, with names in `StringTableType.MODIFIER_NAMES` by `modifierClass` |
| Combat log names | String table | `StringTableType.COMBAT_LOG_NAMES` by `attackerName` and `targetName` |
| Player info | String table | `StringTableType.USER_INFO`: `name`, `steamid` |

Field prefixes:

- `entindex` holds an entity index for `demo.getEntity()`.
- `m_h*` holds a handle for `demo.getEntityByHandle()`.

Dota 2 demos have no user commands, and player orders arrive in `DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS` instead.

## Examples

The scripts live in [`examples-node-dota2`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-dota2/scripts). A script runs with `node ./packages/examples-node-dota2/scripts/<file>`. Missing demos are downloaded from [deadem.com](https://deadem.com), and scripts that read a demo accept `--demo=<path>`.

Parser:

- [`100_parse.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js): parse a single replay.
- [`101_parse_multiple.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/101_parse_multiple.js): parse several replays, for example `--matches="8773493455,8777738576"`.
- [`102_parse_selective.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/102_parse_selective.js): parse with filters.
- [`103_parse_chat.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/103_parse_chat.js): chat messages.
- [`104_parse_entity_field_stats.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/104_parse_entity_field_stats.js): the entity classes and fields that change most often.
- [`105_parse_combat_log.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/105_parse_combat_log.js): the combat log with names from `CombatLogNames`.
- [`106_parse_unit_orders.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/106_parse_unit_orders.js): the unit order fields that change most often.

Player:

- [`200_play.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/200_play.js): load, seek, play and pause a replay.

## Compatibility

- **Game patches:** Dota 2 demos from patch `7.41f` and below.
- **Runtimes:** Node.js 18 and later, Deno, Bun, and Chrome, Firefox, Safari and Edge.

## Performance

| Configuration | Ticks/sec | MB/sec | 30-min replay, sec | Max RSS, MB |
| --- | --- | --- | --- | --- |
| Everything | 43 575 | 57 | ~1.24 | 429 |
| Chat only | 182 698 | 240 | ~0.30 | 310 |
| Player controllers only | 102 018 | 134 | ~0.53 | 276 |

```js
// Everything
ParserConfiguration.DEFAULT

// Chat only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ] })

// Player controllers only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ], entityClasses: [ 'CDOTAPlayerController' ] })
```

Measured with [`000_benchmark.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/000_benchmark.js) on Node.js v22.14.0. Filters and speed tips are in the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance).

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
