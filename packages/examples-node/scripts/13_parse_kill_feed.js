import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';
import GameObserver from 'deadem-examples-common/data/GameObserver.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_38969017);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 4 }));
    const printer = new Printer(parser);

    const gameObserver = new GameObserver(parser, Infinity);

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.CITADEL_USER_MESSAGE_HERO_KILLED) {
            return;
        }

        gameObserver.forceUpdate();

        const demo = parser.getDemo();

        let entityAttacker;

        if (messagePacket.data.entindexAttacker === -1) {
            entityAttacker = null;
        } else {
            entityAttacker = getEntity(demo, messagePacket.data.entindexAttacker);
        }

        let entityScorer;

        if (messagePacket.data.entindexScorer === -1) {
            entityScorer = null;
        } else {
            entityScorer = getEntity(demo, messagePacket.data.entindexScorer);
        }

        let entityVictim;

        if (messagePacket.data.entindexVictim === -1) {
            entityVictim = null;
        } else {
            entityVictim = getEntity(demo, messagePacket.data.entindexVictim);
        }

        if (entityAttacker === null && entityScorer === null) {
            console.warn('Unhandled case: entityAttacker is null and entityScorer is null. Skipping');

            return;
        }

        if (entityVictim === null) {
            console.warn('Unhandled case: entityVictim is null. Skipping');

            return;
        }

        const entityKiller = entityScorer || entityAttacker;

        console.log(`${gameObserver.getGameClockFormatted()}: ${getEntityLog(demo, entityKiller)} -> ${getEntityLog(demo, entityVictim)}`);

        messagePacket.data.entindexAssisters.forEach((assistIndex) => {
            const entity = demo.getEntity(assistIndex);

            console.log(`└──── Assist ${getEntityLog(demo, entity)}`);
        });
    });

    await parser.parse(reader);

    printer.printStats();
})();

/**
 * @param {Demo} demo
 * @param {number} entityIndex
 * @returns {Entity|null}
 */
function getEntity(demo, entityIndex) {
    const entity = demo.getEntity(entityIndex);

    if (entity === null) {
        throw new Error(`Unable to get entity with index [ ${entityIndex} ]`);
    }

    return entity;
}

/**
 * @param {Demo} demo
 * @param {Entity} entity
 * @returns {Entity|null}
 */
function getEntityOwner(demo, entity) {
    const ownerEntityHandle = entity.unpackFlattened().m_hOwnerEntity;
    const ownerEntity = demo.getEntityByHandle(ownerEntityHandle);

    if (ownerEntity === null) {
        throw new Error(`Unable to get owner entity by handle [ ${ownerEntityHandle} ]`);
    }

    return ownerEntity;
}

/**
 * @param {Demo} demo
 * @param {Entity} entity
 * @returns {string}
 */
function getEntityLog(demo, entity) {
    let log;

    switch (entity.class.name) {
        case 'CCitadelPlayerPawn': {
            const ownerEntity = getEntityOwner(demo, entity);

            const data = ownerEntity.unpackFlattened();

            log = `[ Team ${data.m_iTeamNum} ] [ ${ownerEntity.class.name} ] ${data.m_iszPlayerName}`;

            break;
        }
        default: {
            const data = entity.unpackFlattened();

            log = `[ Team ${data.m_iTeamNum} ] [ ${entity.class.name} ]`;

            break;
        }
    }

    return log;
}
