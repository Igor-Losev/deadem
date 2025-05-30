import { InterceptorStage, MessagePacketType, Parser, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_35244871);

    const parser = new Parser();
    const printer = new Printer(parser);

    let gameTime = null;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type === MessagePacketType.NET_TICK) {
            const demo = parser.getDemo();

            if (demo.server === null) {
                return;
            }

            const tick = messagePacket.data.tick;

            const tickRate = demo.server.tickRate;

            gameTime = tick / tickRate;
        }
    });

    await parser.parse(reader);

    printer.printStats();

    console.log(`Game finished in [ ${gameTime} ] seconds`);
})();
