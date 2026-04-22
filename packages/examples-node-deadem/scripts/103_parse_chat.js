import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 3,
        messagePacketTypes: [ MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE, MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL ] 
    }));

    const players = new Map();

    parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
        if (players.size === 0 && !demoPacket.getIsInitial()) {
            const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

            for (const entry of userInfo.getEntries()) {
                if (Number.isInteger(entry.value.userid)) {
                    players.set(entry.value.userid, entry.value.name);
                }
            }
        }
    });

    const getUserName = slot => players.get(slot);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        const isChatMessage = messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE;
        const isChatWheel = messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL;

        if (!isChatMessage && !isChatWheel) {
            return;
        }

        if (isChatMessage) {
            console.log(`CHAT_MESSAGE: ${getUserName(messagePacket.data.playerSlot)} - ${messagePacket.data.text}`);
        } else {
            console.log(`CHAT_WHEEL: ${getUserName(messagePacket.data.accountId)} - ${messagePacket.data.chatMessageId} ${messagePacket.data.param_1}`);
        }
    });

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();
