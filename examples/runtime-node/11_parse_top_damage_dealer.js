import { InterceptorStage, Parser, ParserConfiguration, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_36126420);

    const configuration = new ParserConfiguration({ parserThreads: 0 });

    const parser = new Parser(configuration);
    const printer = new Printer(parser);

    const topDamageDealer = {
        player: null,
        damage: 0
    };

    parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, async (demoPacket, messagePacket, events) => {
        events.forEach((event) => {
            const entity = event.entity;

            if (entity.class.name === 'CCitadelPlayerController') {
                const data = entity.unpackFlattened();

                if (data.m_iHeroDamage > topDamageDealer.damage) {
                    topDamageDealer.player = data.m_iszPlayerName;
                    topDamageDealer.damage = data.m_iHeroDamage;
                }
            }
        });
    });

    await parser.parse(reader);

    printer.printStats();

    console.log(`Top damage dealer is [ ${topDamageDealer.player} ] with [ ${topDamageDealer.damage} ] damage`);
})();
