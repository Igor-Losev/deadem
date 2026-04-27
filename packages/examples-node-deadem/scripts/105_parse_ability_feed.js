import { InterceptorStage, Logger, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DeadlockGameObserver from '@deademx/examples-common/data/DeadlockGameObserver.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);
    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [
            MessagePacketType.CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED,
            MessagePacketType.SVC_PACKET_ENTITIES
        ],
        entityClasses: [ 'CCitadelGameRulesProxy', 'CCitadelPlayerController', 'CCitadelPlayerPawn' ]
    }), Logger.CONSOLE_WARN);

    const printer = new Printer(parser);
    const gameObserver = new DeadlockGameObserver(parser, Infinity);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED) {
            return;
        }

        gameObserver.forceUpdate();

        const caster = getCasterLog(parser.getDemo(), messagePacket.data.caster);

        console.log(`[ ${gameObserver.getGameClockFormatted()} ] ${caster} | ${messagePacket.data.abilityName}`);
    });

    await parser.parse(reader);
    printer.printStats();
    await parser.dispose();
})();

/**
 * @param {Demo} demo
 * @param {number} handle
 * @returns {string}
 */
function getCasterLog(demo, handle) {
    const entity = demo.getEntityByHandle(handle);

    if (entity === null) {
        return `[ handle ${handle} ]`;
    }

    if (entity.class.name !== 'CCitadelPlayerPawn') {
        return `[ ${entity.class.name} #${entity.index} ]`;
    }

    const owner = demo.getEntityByHandle(entity.unpackFlattened().m_hOwnerEntity);

    if (owner === null) {
        return `[ CCitadelPlayerPawn #${entity.index} ]`;
    }

    const data = owner.unpackFlattened();

    return `[ Team ${data.m_iTeamNum} ] ${data.m_iszPlayerName} (#${entity.index})`;
}
