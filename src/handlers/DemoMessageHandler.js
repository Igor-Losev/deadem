import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';

import Demo from './../data/Demo.js';
import Server from './../data/Server.js';

import Entity from './../data/entity/Entity.js';
import EntityMutationEvent from './../data/entity/EntityMutationEvent.js';

import EntityOperation from './../data/enums/EntityOperation.js';

import EntityMutationExtractor from '#extractors/EntityMutationExtractor.js';

class DemoMessageHandler {
    /**
     * @constructor
     * @param {Demo} demo
     */
    constructor(demo) {
        Assert.isTrue(demo instanceof Demo);

        this._demo = demo;
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
        this._demo.stringTableContainer.handleCreate(messagePacket.data);
    }

    /**
     * Handles a {@link MessagePacketType.SVC_UPDATE_STRING_TABLE} (ID = 45).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcUpdateStringTable(messagePacket) {
        this._demo.stringTableContainer.handleUpdate(messagePacket.data);
    }

    /**
     * Handles a {@link MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES} (ID = 51).
     *
     * @public
     * @param {MessagePacket} messagePacket
     */
    handleSvcClearAllStringTables() {
        this._demo.stringTableContainer.handleClear();
    }

    /**
     * Handles a {@link MessagePacketType.SVC_PACKET_ENTITIES} (ID = 55).
     *
     * @public
     * @param {MessagePacket} messagePacket
     * @returns {Array<EntityMutationEvent>}
     */
    handleSvcPacketEntities(messagePacket) {
        const message = messagePacket.data;

        const bitBuffer = new BitBuffer(message.entityData);

        if (message.updateBaseline) {
            throw new Error('Unhandled CSVCMsg_PacketEntities.updateBaseline === true');
        }

        if (this._demo.server === null) {
            throw new Error('CSVCMsg_PacketEntities found, but server data is missing');
        }

        const events = [ ];

        let index = -1;

        for (let i = 0; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.read(2)[0];

            switch (command) {
                case EntityOperation.UPDATE.id: {
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    const extractor = new EntityMutationExtractor(bitBuffer, entity.class.serializer);

                    const mutations = extractor.all();

                    const event = new EntityMutationEvent(EntityOperation.UPDATE, entity, mutations);

                    events.push(event);

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

                    const event = new EntityMutationEvent(EntityOperation.LEAVE, entity, [ ]);

                    events.push(event);

                    break;
                }
                case EntityOperation.CREATE.id: {
                    const classIdSizeBits = this._demo.server.classIdSizeBits;

                    const classId = BitBuffer.readUInt32LE(bitBuffer.read(classIdSizeBits));
                    const serial = BitBuffer.readUInt32LE(bitBuffer.read(17));

                    bitBuffer.readUVarInt32();

                    const clazz = this._demo.getClassById(classId);

                    if (clazz === null) {
                        throw new Error(`Class not found [ ${classId} ]`);
                    }

                    const baseline = this._demo.getClassBaselineById(classId);

                    if (baseline === null) {
                        throw new Error(`Baseline not found [ ${classId} ]`);
                    }

                    const entity = new Entity(index, serial, clazz);

                    this._demo.registerEntity(entity);

                    const extractorForBaseline = new EntityMutationExtractor(new BitBuffer(baseline), entity.class.serializer);
                    const extractorForPacket = new EntityMutationExtractor(bitBuffer, entity.class.serializer);

                    const mutationsFromBaseline = extractorForBaseline.all();
                    const mutationsFromPacket = extractorForPacket.all();

                    const event = new EntityMutationEvent(EntityOperation.CREATE, entity, mutationsFromBaseline.concat(mutationsFromPacket));

                    events.push(event);

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

                    const deleted = this._demo.deleteEntity(index);

                    if (deleted === null) {
                        throw new Error(`Received delete entity command. However, entity with index [ ${index} ] doesn't exist`);
                    }

                    const event = new EntityMutationEvent(EntityOperation.DELETE, entity, [ ]);

                    events.push(event);

                    break;
                }
            }
        }

        return events;
    }
}

export default DemoMessageHandler;
