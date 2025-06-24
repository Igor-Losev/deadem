import { InterceptorStage, MessagePacketType, Parser, Printer, StringTableType } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_37289347);

    const parser = new Parser();
    const printer = new Printer(parser);

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
        switch (messagePacket.type) {
            case MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE:
                console.log(`CHAT_MESSAGE: ${getUserName(messagePacket.data.playerSlot)} - ${messagePacket.data.text}`);

                break;
            case MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL:
                console.log(`CHAT_WHEEL: ${getUserName(messagePacket.data.accountId)} - ${messagePacket.data.chatMessageId} ${messagePacket.data.param_1}`);

                break;
            default:
                break;
        }
    });

    await parser.parse(reader);

    printer.printStats();
})();
