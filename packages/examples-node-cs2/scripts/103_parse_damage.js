import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.CS2_REPLAY_SAMPLE);
    const parser = new Parser(new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.CS_UM_DAMAGE ] }));

    let counter = 0;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.CS_UM_DAMAGE) {
            return;
        }

        counter += 1;

        console.log(`#${counter} tick=${demoPacket.tick}`);
        console.log(messagePacket.data);
    });

    await parser.parse(reader);
    await parser.dispose();

    console.log(`Parsed [ ${counter} ] damage messages`);
})();
