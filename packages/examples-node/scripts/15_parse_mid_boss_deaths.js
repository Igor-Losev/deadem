import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';
import GameObserver from 'deadem-examples-common/data/GameObserver.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_38969017);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 4 }));
    const printer = new Printer(parser);

    const gameObserver = new GameObserver(parser, Infinity);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        const isBossMidSpawned = messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED;
        const isBossKilled = messagePacket.type === MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED;

        if (!isBossMidSpawned && !isBossKilled) {
            return;
        }

        gameObserver.forceUpdate();

        if (isBossMidSpawned) {
            console.log(`[ ${gameObserver.getGameClockFormatted()} ]: Mid Boss Spawned`);
        } else {
            const entity = getEntity(parser.getDemo(), messagePacket.data.entityKilled);

            const unpacked = entity.unpackFlattened();

            if (unpacked.m_iTeamNum === 4) {
                console.log(`[ ${gameObserver.getGameClockFormatted()} ]: Mid Boss Killed`);
            }
        }
    });

    await parser.parse(reader);

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
