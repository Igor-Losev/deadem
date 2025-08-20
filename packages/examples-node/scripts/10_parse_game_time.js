import { InterceptorStage, MessagePacketType, Parser, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';
import GameClockObserver from 'deadem-examples-common/data/GameClockObserver.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_37610767);

    const parser = new Parser();
    const printer = new Printer(parser);

    const gameClockObserver = new GameClockObserver(parser);

    let clock = null;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_GAME_OVER) {
            clock = gameClockObserver.getClockFormatted();
        }
    });

    await parser.parse(reader);

    printer.printStats();

    console.log(`Game finished: [ ${clock} ]`);
})();
