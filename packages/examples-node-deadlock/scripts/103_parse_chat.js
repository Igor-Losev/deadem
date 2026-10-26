import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from '@deademx/deadlock';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DEADLOCK_REPLAY_112633589);

    const parser = new Parser(new ParserConfiguration({
        messagePacketTypes: [ MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE ]
    }));

    const players = new Map();

    parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
        if (players.size === 0 && !demoPacket.getIsInitial()) {
            const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

            for (const entry of userInfo.getEntries()) {
                if (entry.value !== null && Number.isInteger(entry.value.userid)) {
                    players.set(entry.value.userid, entry.value.name);
                }
            }
        }
    });

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (!messagePacket.is(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE)) {
            return;
        }

        console.log(`${players.get(messagePacket.data.playerSlot)}: ${messagePacket.data.text}`);
    });

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();
