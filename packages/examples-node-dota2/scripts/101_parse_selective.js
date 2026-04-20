import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from '@deadem/dota2';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';
import DemoProvider from '@deadem/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DOTA2_REPLAY_8777738576);

    const parser = new Parser(new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ] }));

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.DOTA_UM_CHAT_MESSAGE) {
            return;
        }

        console.log(messagePacket.data);
    });

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();
