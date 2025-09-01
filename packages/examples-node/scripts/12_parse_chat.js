import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';
import GameObserver from 'deadem-examples-common/data/GameObserver.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_38969017);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 4 }));
    const printer = new Printer(parser);

    const gameObserver = new GameObserver(parser, Infinity);

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

        gameObserver.forceUpdate();

        const gameData = gameObserver.getGameFormatted();

        if (isChatMessage) {
            console.log(`CHAT_MESSAGE [ ${gameData.state}|${gameData.clockGame} ]: ${getUserName(messagePacket.data.playerSlot)} - ${messagePacket.data.text}`);
        } else {
            console.log(`CHAT_WHEEL: [ ${gameData.state}|${gameData.clockGame} ]: ${getUserName(messagePacket.data.accountId)} - ${messagePacket.data.chatMessageId} ${messagePacket.data.param_1}`);
        }
    });

    await parser.parse(reader);

    printer.printStats();
})();
