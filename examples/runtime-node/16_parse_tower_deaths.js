import { InterceptorStage, MessagePacketType, Parser, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';
import GameClockObserver from '#root/examples/common/GameClockObserver.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_37610767);

    const parser = new Parser();
    const printer = new Printer(parser);

    const gameClockObserver = new GameClockObserver(parser);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        switch (messagePacket.type) {
            case MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED: {
                const entity = getEntity(parser.getDemo(), messagePacket.data.entityKilled);

                const unpacked = entity.unpackFlattened();

                if (unpacked.m_iTeamNum !== 4) {
                    console.log(`[ ${gameClockObserver.getClockFormatted()} ]: Tower Destroyed, Team [ ${messagePacket.data.objectiveTeam} ]`);
                }

                break;
            }
            default: {
                break;
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
