import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';
import GameObserver from '@deadem/examples-common/data/GameObserver.js';

import DemoProvider from '@deadem/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES, MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED ]
    }));
    const printer = new Printer(parser);

    const gameObserver = new GameObserver(parser, Infinity);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED) {
            return;
        }

        gameObserver.forceUpdate();

        const entity = getEntity(parser.getDemo(), messagePacket.data.entityKilled);

        const unpacked = entity.unpackFlattened();

        if (unpacked.m_iTeamNum !== 4) {
            console.log(`[ ${gameObserver.getGameClockFormatted()} ]: Tower Destroyed, Team [ ${messagePacket.data.objectiveTeam} ]`);
        }
    });

    await parser.parse(reader);
    await parser.dispose();

    printer.printStats();
})();

/**
 * @param {Demo} demo
 * @param {number} entityHandle
 * @returns {Entity|null}
 */
function getEntity(demo, entityHandle) {
    const entity = demo.getEntityByHandle(entityHandle);

    if (entity === null) {
        throw new Error(`Unable to get entity with handle [ ${entityHandle} ]`);
    }

    return entity;
}
