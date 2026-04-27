import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';

import Demo from '#data/Demo.js';
import Server from '#data/Server.js';

import Entity from '#data/entity/Entity.js';
import EntityMutationEvent from '#data/entity/EntityMutationEvent.js';
import EntityMutationPartialEvent from '#data/entity/EntityMutationPartialEvent.js';

import EntityOperation from '#data/enums/EntityOperation.js';

import EntityMutationExtractor from '#extractors/EntityMutationExtractor.js';
import EntityPayloadSizeExtractor from '#extractors/EntityPayloadSizeExtractor.js';

import StringTableHandler from '#handlers/StringTableHandler.js';

import SchemaRegistry from '#src/SchemaRegistry.js';

class DemoMessageHandler {
    /**
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {Demo} demo
     * @param {StringTableHandler} stringTableHandler
     * @param {(function(string): boolean)|null} [entityClassFilter=null]
     */
    constructor(registry, demo, stringTableHandler, entityClassFilter = null) {
        Assert.isTrue(registry instanceof SchemaRegistry);
        Assert.isTrue(demo instanceof Demo);
        Assert.isTrue(stringTableHandler instanceof StringTableHandler);
        Assert.isTrue(entityClassFilter === null || typeof entityClassFilter === 'function');

        this._registry = registry;
        this._demo = demo;
        this._stringTableHandler = stringTableHandler;
        this._entityClassFilter = entityClassFilter;
    }

    /**
     * Handles a {@link MessagePacketType.SVC_SERVER_INFO} (ID = 40).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcServerInfo(messagePacket) {
        const message = messagePacket.data;

        const server = new Server(message.maxClasses, message.maxClients, message.tickInterval);

        this._demo.registerServer(server);
    }

    /**
     * Handles a {@link MessagePacketType.SVC_CREATE_STRING_TABLE} (ID = 44).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcCreateStringTable(messagePacket) {
        this._stringTableHandler.handleCreate(messagePacket.data);
    }

    /**
     * Handles a {@link MessagePacketType.SVC_UPDATE_STRING_TABLE} (ID = 45).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcUpdateStringTable(messagePacket) {
        this._stringTableHandler.handleUpdate(messagePacket.data);
    }

    /**
     * Handles a {@link MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES} (ID = 51).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcClearAllStringTables() {
        this._stringTableHandler.handleClear();
    }

    /**
     * Handles a {@link MessagePacketType.SVC_PACKET_ENTITIES} (ID = 55).
     *
     * @public
     * @param {MessagePacket} messagePacket
     * @param {number} [startPointer=0]
     * @param {number} [startLoop=0]
     * @param {number} [startIndex=-1]
     * @returns {Array<EntityMutationEvent>}
     */
    handleSvcPacketEntities(messagePacket, startPointer = 0, startLoop = 0, startIndex = -1) {
        const message = messagePacket.data;

        if (message.updateBaseline) {
            throw new Error('Unhandled CSVCMsg_PacketEntities.updateBaseline === true');
        }

        if (this._demo.server === null) {
            throw new Error('CSVCMsg_PacketEntities found, but server data is missing');
        }

        const bitBuffer = new BitBuffer(message.entityData);

        bitBuffer.move(startPointer);

        const hasFilter = this._entityClassFilter !== null;
        const payloadSizes = hasFilter ? createPayloadIterator(message, startLoop) : null;

        const events = [];

        let index = startIndex;

        for (let i = startLoop; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.readBitsAsUInt(2);

            switch (command) {
                case EntityOperation.UPDATE.id: {
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    const allowed = !hasFilter || this._entityClassFilter(entity.class.name);
                    const payloadBits = payloadSizes !== null ? payloadSizes.next().value : null;

                    if (allowed) {
                        const extractor = new EntityMutationExtractor(bitBuffer, entity.class.serializer);

                        events.push(new EntityMutationEvent(EntityOperation.UPDATE, entity, extractor.all()));
                    } else if (payloadBits !== null) {
                        bitBuffer.move(payloadBits);
                    } else {
                        new EntityMutationExtractor(bitBuffer, entity.class.serializer).skip();
                    }

                    break;
                }
                case EntityOperation.LEAVE.id: {
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    if (!entity.active) {
                        throw new Error(`Unable to leave entity with index [ ${index} ] - inactive`);
                    }

                    if (!hasFilter || this._entityClassFilter(entity.class.name)) {
                        events.push(new EntityMutationEvent(EntityOperation.LEAVE, entity, []));
                    } else {
                        entity.deactivate();
                    }

                    break;
                }
                case EntityOperation.CREATE.id: {
                    const classIdSizeBits = this._demo.server.classIdSizeBits;

                    const classId = bitBuffer.readBitsAsUInt(classIdSizeBits);
                    const serial = bitBuffer.readBitsAsUInt(17);

                    bitBuffer.readUVarInt32();

                    const clazz = this._demo.getClassById(classId);

                    if (clazz === null) {
                        throw new Error(`Class not found [ ${classId} ]`);
                    }

                    const entity = new Entity(index, serial, clazz);

                    const allowed = !hasFilter || this._entityClassFilter(clazz.name);
                    const payloadBits = payloadSizes !== null ? payloadSizes.next().value : null;

                    if (allowed) {
                        const baseline = this._demo.getClassBaselineById(classId);

                        if (baseline === null) {
                            throw new Error(`Baseline not found [ ${classId} ]`);
                        }

                        const extractorForBaseline = new EntityMutationExtractor(new BitBuffer(baseline), entity.class.serializer);
                        const extractorForPacket = new EntityMutationExtractor(bitBuffer, entity.class.serializer);

                        const mutationsFromBaseline = extractorForBaseline.all();
                        const mutationsFromPacket = extractorForPacket.all();

                        const mutations = mutationsFromBaseline.concat(mutationsFromPacket);

                        events.push(new EntityMutationEvent(EntityOperation.CREATE, entity, mutations));
                    } else {
                        this._demo.registerEntity(entity);

                        if (payloadBits !== null) {
                            bitBuffer.move(payloadBits);
                        } else {
                            new EntityMutationExtractor(bitBuffer, entity.class.serializer).skip();
                        }
                    }

                    break;
                }
                case EntityOperation.DELETE.id: {
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    if (!entity.active) {
                        throw new Error(`Unable to delete entity with index [ ${index} ] - inactive`);
                    }

                    if (!hasFilter || this._entityClassFilter(entity.class.name)) {
                        events.push(new EntityMutationEvent(EntityOperation.DELETE, entity, []));
                    } else {
                        this._demo.deleteEntity(index);
                    }

                    break;
                }
            }
        }

        return events;
    }

    /**
     * Handles a partial of the {@link MessagePacketType.SVC_PACKET_ENTITIES} (ID = 55).
     *
     * @public
     * @param {MessagePacket} messagePacket
     * @returns {Array<EntityMutationPartialEvent>}
     */
    handleSvcPacketEntitiesPartial(messagePacket) {
        const message = messagePacket.data;

        const events = [];

        const bitBuffer = new BitBuffer(message.entityData);

        let index = -1;

        for (let i = 0; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.readBitsAsUInt(2);

            switch (command) {
                case EntityOperation.UPDATE.id: {
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        return events;
                    }

                    try {
                        const extractor = new EntityMutationExtractor(bitBuffer, entity.class.serializer);

                        const mutations = extractor.allPacked();

                        const event = new EntityMutationPartialEvent(bitBuffer.getReadCount(), index, entity.class.id, mutations);

                        events.push(event);
                    } catch {
                        return events;
                    }

                    break;
                }
                default:
                    return events;
            }
        }

        return events;
    }
}

/**
 * Builds a payload-size iterator over the packet's `serializedEntities` index.
 *
 * @param {object} message
 * @param {number} [startLoop=0]
 * @returns {Generator<number, void, *>|null}
 */
function createPayloadIterator(message, startLoop = 0) {
    const buffer = message.serializedEntities;

    if (!buffer || buffer.length === 0) {
        return null;
    }

    const iterator = new EntityPayloadSizeExtractor(buffer).retrieve();

    for (let i = 0; i < startLoop; i++) {
        iterator.next();
    }

    return iterator;
}

export default DemoMessageHandler;
