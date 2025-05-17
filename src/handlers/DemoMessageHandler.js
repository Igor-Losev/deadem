'use strict';

const assert = require('assert/strict');

const Demo = require('./../data/Demo'),
    Entity = require('./../data/Entity'),
    EntityState = require('./../data/EntityState'),
    Server = require('./../data/Server');

const BitBuffer = require('./../data/buffer/BitBufferFast');

class DemoMessageHandler {
    /**
     * @constructor
     * @param {Demo} demo
     */
    constructor(demo) {
        assert(demo instanceof Demo);

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

        const server = new Server(message.maxClasses, message.maxClients);

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
    handleSvcClearAllStringTables(messagePacket) {
        this._demo.stringTableContainer.handleClear();
    }

    /**
     * Handles a {@link MessagePacketType.SVC_PACKET_ENTITIES} (ID = 55).
     *
     * @public
     * @param {MessagePacket} messagePacket
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

        let index = -1;

        for (let i = 0; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.read(2)[0];

            switch (command) {
                case 0: { // Update
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    const state = new EntityState();

                    state.read(bitBuffer, entity.class.serializer);

                    break;
                }
                case 1: { // Leave
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    // TODO: entity.active ?

                    break;
                }
                case 2: { // Create
                    const classIdSizeBits = this._demo.server.classIdSizeBits;

                    const bufferForClassId = bitBuffer.read(classIdSizeBits);
                    const bufferForSerial = bitBuffer.read(17);

                    const ignored = bitBuffer.readUVarInt32();

                    const classId = BitBuffer.readUInt32LE(bufferForClassId);
                    const serial = BitBuffer.readUInt32LE(bufferForSerial);

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

                    const state = new EntityState();

                    state.read(new BitBuffer(baseline), clazz.serializer);
                    state.read(bitBuffer, clazz.serializer);

                    // ---- TODO: Update entity state

                    break;
                }
                case 3: { // Delete
                    const entity = this._demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    // TODO: entity.active ?

                    const deleted = this._demo.deleteEntity(index);

                    if (deleted === null) {
                        throw new Error(`Received delete entity command. However, entity with index [ ${index} ] doesn't exist`);
                    }

                    break;
                }
            }
        }
    }
}

module.exports = DemoMessageHandler;
