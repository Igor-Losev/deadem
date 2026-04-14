import { Player } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_75438101);

    const player = new Player();

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    const demo = player.getDemo();
    const entities = demo.getEntitiesByClassName('CCitadelPlayerController');

    const topDamageDealer = entities.reduce((accumulator, entity) => {
        const data = entity.unpackFlattened();

        if (data.m_iHeroDamage > accumulator.damage) {
            accumulator.player = data.m_iszPlayerName;
            accumulator.damage = data.m_iHeroDamage;
        }

        return accumulator;
    }, { damage: 0, player: null });

    await player.dispose();

    console.log(`Top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
})();
