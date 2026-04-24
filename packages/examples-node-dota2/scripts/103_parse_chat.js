import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DOTA2_REPLAY_8777738576);
    const parser = new Parser(new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ] }));

    let counter = 0;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.DOTA_UM_CHAT_MESSAGE) {
            return;
        }

        counter += 1;

        console.log(`#${counter} tick=${demoPacket.tick}`);
        console.log(messagePacket.data);
    });

    await parser.parse(reader);
    await parser.dispose();

    console.log(`Parsed [ ${counter} ] chat messages`);
})();
