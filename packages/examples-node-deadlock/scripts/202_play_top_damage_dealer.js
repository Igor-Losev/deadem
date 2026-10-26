import { Player } from '@deademx/deadlock';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DEADLOCK_REPLAY_112633589);

    const player = new Player();

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    const demo = player.getDemo();
    const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

    const topDamageDealer = entities.reduce((accumulator, entity) => {
        const damage = /** @type {number} */ (entity.getField('m_PlayerDataGlobal.m_iHeroDamage') || 0);

        if (damage > accumulator.damage) {
            accumulator.player = /** @type {string} */ (entity.getField('m_iszPlayerName'));
            accumulator.damage = damage;
        }

        return accumulator;
    }, { damage: 0, player: /** @type {string|null} */ (null) });

    await player.dispose();

    console.log(`Top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
})();
