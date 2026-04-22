import { Player } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const player = new Player();

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    const demo = player.getDemo();
    const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

    const scoreboard = entities.map((entity) => {
        const data = entity.unpackFlattened();

        return {
            name: data.m_iszPlayerName,
            team: data.m_iTeamNum,
            heroDamage: data.m_iHeroDamage || 0
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
