import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DeadlockGameObserver from '@deademx/examples-common/data/DeadlockGameObserver.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [
            MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED,
            MessagePacketType.SVC_PACKET_ENTITIES
        ],
        entityClasses: [
            'CCitadelGameRulesProxy',
            'CCitadel_Destroyable_Building',
            'CNPC_BarrackBoss',
            'CNPC_Boss_Tier2',
            'CNPC_Boss_Tier3',
            'CNPC_MidBoss',
            'CNPC_TrooperBoss'
        ]
    }));

    const printer = new Printer(parser);
    const gameObserver = new DeadlockGameObserver(parser, Infinity);

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
