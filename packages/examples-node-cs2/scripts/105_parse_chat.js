import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.CS2_REPLAY_SAMPLE);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [ MessagePacketType.USER_MESSAGE_SAY_TEXT_2 ]
    }));

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.USER_MESSAGE_SAY_TEXT_2) {
            return;
        }

        const channel = CHAT_CHANNELS[messagePacket.data.messagename] || messagePacket.data.messagename;

        console.log(`${channel} ${messagePacket.data.param1}: ${messagePacket.data.param2}`);
    });

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

const CHAT_CHANNELS = {
    Cstrike_Chat_All: '[ALL]',
    Cstrike_Chat_AllDead: '[DEAD]',
    Cstrike_Chat_AllSpec: '[SPEC]',
    Cstrike_Chat_CT: '[CT]',
    Cstrike_Chat_CT_Dead: '[CT DEAD]',
    Cstrike_Chat_T: '[T]',
    Cstrike_Chat_T_Dead: '[T DEAD]'
};
