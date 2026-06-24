import { Player } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DEADLOCK_REPLAY_75438101);

    const player = new Player();

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    const demo = player.getDemo();
    const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

    const topDamageDealer = entities.reduce((accumulator, entity) => {
        const damage = entity.getField('m_iHeroDamage') || 0;

        if (damage > accumulator.damage) {
            accumulator.player = entity.getField('m_iszPlayerName');
            accumulator.damage = damage;
        }

        return accumulator;
    }, { damage: 0, player: null });

    await player.dispose();

    console.log(`Top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
})();
