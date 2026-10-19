import { Player } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const TEAM_SPECTATOR = 1;

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DEADLOCK_REPLAY_112633589);

    const player = new Player();

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    const demo = player.getDemo();
    const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

    const scoreboard = entities
        .filter(entity => entity.getField('m_iTeamNum') !== TEAM_SPECTATOR)
        .map((entity) => {
            return {
                name: /** @type {string} */ (entity.getField('m_iszPlayerName')),
                team: /** @type {number} */ (entity.getField('m_iTeamNum')),
                heroDamage: /** @type {number} */ (entity.getField('m_PlayerDataGlobal.m_iHeroDamage') || 0)
            };
        });

    scoreboard.sort((a, b) => a.team - b.team || b.heroDamage - a.heroDamage);

    await player.dispose();

    console.log('\n--- Scoreboard ---\n');

    let currentTeam = null;

    for (const entry of scoreboard) {
        if (entry.team !== currentTeam) {
            currentTeam = entry.team;

            console.log(`\nTeam ${currentTeam}:`);
            console.log('-'.repeat(40));
        }

        console.log(`${entry.name.padEnd(20)} Hero Damage: ${entry.heroDamage}`);
    }
})();
