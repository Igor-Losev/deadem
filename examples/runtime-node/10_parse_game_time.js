import { InterceptorStage, MessagePacketType, Parser, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';
import GameClockObserver from '#root/examples/common/GameClockObserver.js';

import DemoProvider from './helpers/DemoProvider.js';

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
