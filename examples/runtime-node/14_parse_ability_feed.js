import { InterceptorStage, MessagePacketType, Parser, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_37289347);

    const parser = new Parser();
    const printer = new Printer(parser);

    let descriptor = null;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        switch (messagePacket.type) {
            case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST: {
                descriptor = messagePacket.data.descriptors.find(d => d.name === 'player_used_ability');

                break;
            }
            case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT: {
                if (descriptor === null) {
                    throw new Error('GE_SOURCE1_LEGACY_GAME_EVENT is fired, however, descriptor is [ null ]');
                }

                if (messagePacket.data.eventid !== descriptor.eventid) {
                    break;
                }

                const keyAbilityIndex = descriptor.keys.findIndex(k => k.name === 'abilityname');
                const keyEntityIndex = descriptor.keys.findIndex(k => k.name === 'entindex_player');

                if (keyAbilityIndex === -1 || keyEntityIndex === -1) {
                    throw new Error('Unable to find keys [ abilityname ] and/or [ entindex_player ]');
                }

                const demo = parser.getDemo();

                const abilityName = messagePacket.data.keys[keyAbilityIndex].valString;
                const entityIndex = messagePacket.data.keys[keyEntityIndex].valLong;

                const entity = getEntity(demo, entityIndex);

                if (entity.class.name !== 'CCitadelPlayerPawn') {
                    console.warn(`Unhandled entity class: [ ${entity.class.name} ]`);

                    break;
                }

                const ownerEntity = getEntityOwner(demo, entity);
                const data = ownerEntity.unpackFlattened();

                console.log(`[ Team ${data.m_iTeamNum} ] [ ${ownerEntity.class.name} ] ${data.m_iszPlayerName} - ${abilityName}`);

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
