<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deademx/deadlock
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/deadlock" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fdeadlock" /></a>
<a href="https://github.com/Igor-Losev/deadem" alt=""><img src="https://img.shields.io/badge/Deadlock%20Game%20Build-6766-darkGreen" /></a>

**@deademx/deadlock** is a Deadlock demo parser and replay player for Node.js, Deno, Bun and browsers. Versions before 5.0.0 were published as [`deadem`](https://www.npmjs.com/package/deadem).

The model and the API are described in the [`@deademx/engine` documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md). This page covers Deadlock: where its data lives, examples and performance.

Other games: [`@deademx/cs2`](https://github.com/Igor-Losev/deadem/blob/main/packages/cs2/README.md) for Counter-Strike 2 and [`@deademx/dota2`](https://github.com/Igor-Losev/deadem/blob/main/packages/dota2/README.md) for Dota 2.

## Contents

- [Installation](#installation)<br/>
  From npm or as a browser bundle.
- [Quick Start](#quick-start)<br/>
  The scoreboard of a match.
- [Where to Find](#where-to-find)<br/>
  Deadlock data and its source.
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
npm install @deademx/deadlock --save
```

```js
import { Parser, Player } from '@deademx/deadlock';
```

The same import works in Node.js, Deno, Bun and in a browser app built with a bundler such as Vite or webpack.

### CDN

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/deadlock@5.X.X/dist/deadem-deadlock.min.js"></script>
```

```js
const { Parser, Player } = window.deadem.deadlock;
```

## Quick Start

```js
import { createReadStream } from 'node:fs';

import { Parser } from '@deademx/deadlock';

const parser = new Parser();

await parser.parse(createReadStream('./match.dem'));

for (const controller of parser.getDemo().getEntitiesByClassName('CCitadelPlayerController')) {
    if (controller.getField('m_iTeamNum') < 2) continue; // spectators and SourceTV

    const name = controller.getField('m_iszPlayerName');
    const kills = controller.getField('m_PlayerDataGlobal.m_iPlayerKills');
    const deaths = controller.getField('m_PlayerDataGlobal.m_iDeaths');
    const assists = controller.getField('m_PlayerDataGlobal.m_iPlayerAssists');
    const netWorth = controller.getField('m_PlayerDataGlobal.m_iGoldNetWorth');

    console.log(`${name}: ${kills}/${deaths}/${assists}, ${netWorth} souls`);
}

await parser.dispose();
```

## Where to Find

The table lists the most common data. [Deadem Explorer](https://deadem.com) shows every entity with its fields and their types.

| Data | Kind | Source |
| --- | --- | --- |
| Player name, team and hero | Entity | `CCitadelPlayerController`: `m_iszPlayerName`, `m_iTeamNum`, `m_PlayerDataGlobal.m_nHeroID` |
| Kills, deaths, assists and net worth | Entity | `CCitadelPlayerController`, under `m_PlayerDataGlobal`: `m_iPlayerKills`, `m_iDeaths`, `m_iPlayerAssists`, `m_iGoldNetWorth` |
| Hero health | Entity | `CCitadelPlayerPawn`: `m_iHealth`, `m_iMaxHealth` |
| Hero position | Entity | `CCitadelPlayerPawn`, under `CBodyComponent.m_skeletonInstance.m_vecOrigin`: a cell and an offset in it per axis, `m_cellX` and `m_vecX` |
| Hero of a player | Entity | `m_hHeroPawn` on the controller. `m_hController` on the pawn is empty while the hero is dead |
| Abilities, items and cooldowns | Entity | Handles in `m_CCitadelAbilityComponent.m_vecAbilities` on the pawn, `m_flCooldownStart` and `m_flCooldownEnd` on each ability or item |
| Game start and pause | Entity | `CCitadelGameRulesProxy`: `m_pGameRules.m_flGameStartTime`, `m_pGameRules.m_bGamePaused` |
| Damage | Message | `CITADEL_USER_MESSAGE_DAMAGE`: `entindexAttacker`, `entindexVictim`, `damage` |
| Kill feed | Message | `CITADEL_USER_MESSAGE_HERO_KILLED`: `entindexAttacker`, `entindexVictim` |
| Chat | Message | `CITADEL_USER_MESSAGE_CHAT_MESSAGE`: `playerSlot`, `text` |
| Souls | Message | `CITADEL_USER_MESSAGE_CURRENCY_CHANGED`: `userid` (the player slot, or `-1`), `delta`, `newValue` |
| Buffs and debuffs | String table | `StringTableType.ACTIVE_MODIFIERS` |
| Player info | String table | `StringTableType.USER_INFO`: `name`, `steamid` |
| Player input | User command | `command.state`: `base.viewangles`, `inShop`, `enemyHeroAimedAt` |

Field prefixes:

- `entindex*` holds an entity index for `demo.getEntity()`.
- `m_h*` holds a handle for `demo.getEntityByHandle()`.

## Examples

The scripts live in [`examples-node-deadlock`](https://github.com/Igor-Losev/deadem/tree/main/packages/examples-node-deadlock/scripts). A script runs with `node ./packages/examples-node-deadlock/scripts/<file>`. Missing demos are downloaded from [deadem.com](https://deadem.com), and scripts that read a demo accept `--demo=<path>`.

Parser:

- [`100_parse.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/100_parse.js): parse a single replay.
- [`101_parse_multiple.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/101_parse_multiple.js): parse several replays, for example `--matches="36126255,36127043"`.
- [`102_parse_selective.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/102_parse_selective.js): parse with filters.
- [`103_parse_chat.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/103_parse_chat.js): chat messages and chat wheel events.
- [`104_parse_kill_feed.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/104_parse_kill_feed.js): the kill feed.
- [`105_parse_ability_feed.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/105_parse_ability_feed.js): ability usage.
- [`106_parse_mid_boss_deaths.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/106_parse_mid_boss_deaths.js): mid boss spawns and kills.
- [`107_parse_tower_deaths.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/107_parse_tower_deaths.js): tower destructions.
- [`108_parse_entity_field_stats.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/108_parse_entity_field_stats.js): the entity classes and fields that change most often.
- [`109_parse_input_activity.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/109_parse_input_activity.js): the user command fields that change most often.

Player:

- [`200_play.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/200_play.js): load and play a replay.
- [`201_play_game_time.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/201_play_game_time.js): the game duration.
- [`202_play_top_damage_dealer.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/202_play_top_damage_dealer.js): the top damage dealer.
- [`203_play_scoreboard.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/203_play_scoreboard.js): the final scoreboard.

HTTP broadcast:

- [`300_broadcast_save.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/300_broadcast_save.js): save a broadcast to a file.
- [`301_broadcast_parse.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/301_broadcast_parse.js): parse a live broadcast.
- [`302_broadcast_parse_file.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/302_broadcast_parse_file.js): parse a saved broadcast.

## Compatibility

- **Game builds:** Deadlock demos from build `6766` and below.
- **Runtimes:** Node.js 18 and later, Deno, Bun, and Chrome, Firefox, Safari and Edge.

## Performance

| Configuration | Ticks/sec | MB/sec | 30-min replay, sec | Max RSS, MB |
| --- | --- | --- | --- | --- |
| Everything | 17 408 | 57 | ~6.62 | 232 |
| Chat only | 87 077 | 283 | ~1.32 | 218 |
| Player controllers only | 63 757 | 207 | ~1.81 | 199 |
| User commands only | 47 327 | 154 | ~2.43 | 158 |

```js
// Everything
ParserConfiguration.DEFAULT

// Chat only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE ] })

// Player controllers only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ], entityClasses: [ 'CCitadelPlayerController' ] })

// User commands only
new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.SVC_USER_COMMANDS ] })
```

Measured with [`000_benchmark.js`](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-deadlock/scripts/000_benchmark.js) on Node.js v22.14.0. Filters and speed tips are in the [engine documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md#performance).

## License

[MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE)
