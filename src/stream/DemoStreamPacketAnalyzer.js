'use strict';

const assert = require('assert/strict'),
    Stream = require('stream');

const BitBuffer = require('./../data/buffer/BitBufferFast');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const Class = require('./../data/fields/Class'),
    Field = require('./../data/fields/Field'),
    Serializer = require('./../data/fields/Serializer');

const StringTableContainer = require('../data/tables/string/StringTableContainer');

const ProtoProvider = require('./../providers/ProtoProvider.instance');

const CSVCMsg_FlattenedSerializer = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer');

class DemoStreamPacketAnalyzer extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;

        this._classBaselines = new Map();

        this._classes = {
            byId: new Map(),
            byName: new Map()
        };

        this._serializers = new Map();

        this._server = { };
        this._server.classIdBitSize = null;
        this._server.maxClasses = null;
        this._server.maxClients = null;

        this._stringTableContainer = new StringTableContainer();
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        this._parser.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        switch (demoPacket.command) {
            case DemoCommandType.DEM_ERROR:
                break;
            case DemoCommandType.DEM_STOP:
                break;
            case DemoCommandType.DEM_FILE_HEADER:
                break;
            case DemoCommandType.DEM_FILE_INFO:
                break;
            case DemoCommandType.DEM_SYNC_TICK:
                break;
            case DemoCommandType.DEM_SEND_TABLES:
                this._handleDemSendTables(demoPacket.data);

                break;
            case DemoCommandType.DEM_CLASS_INFO:
                this._handleDemClassInfo(demoPacket.data);

                break;
            case DemoCommandType.DEM_STRING_TABLES:
                this._stringTableContainer.handleInstantiate(demoPacket.data);

                break;
            case DemoCommandType.DEM_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_SIGNON_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_CONSOLE_CMD:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA_CALLBACKS:
                break;
            case DemoCommandType.DEM_USER_CMD:
                break;
            case DemoCommandType.DEM_FULL_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_SAVE_GAME:
                break;
            case DemoCommandType.DEM_SPAWN_GROUPS:
                break;
            case DemoCommandType.DEM_ANIMATION_DATA:
                break;
            case DemoCommandType.DEM_ANIMATION_HEADER:
                break;
        }

        this._parser.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        callback();
    }

    /**
     * @protected
     * @param {CDemoClassInfo} classInfo
     */
    _handleDemClassInfo(classInfo) {
        classInfo.classes.forEach((data) => {
            const key = getSerializerKey(data.networkName, 0);

            const serializer = this._serializers.get(key) || null;

            const clazz = new Class(data.classId, data.networkName, serializer);

            this._classes.byId.set(clazz.id, clazz);
            this._classes.byName.set(clazz.name, clazz);
        });
    }

    /**
     * @protected
     * @param {Array<MessagePacket>} messagePackets
     */
    _handleDemPacket(messagePackets) {
        messagePackets.forEach((messagePacket) => {
            switch (messagePacket.type) {
                case MessagePacketType.NET_TICK:
                    break;
                case MessagePacketType.SVC_SERVER_INFO:
                    this._handleMessageServerInfo(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CLASS_INFO:
                    this._handleMessageClassInfo(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CREATE_STRING_TABLE:
                    this._stringTableContainer.handleCreate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                    this._stringTableContainer.handleUpdate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                    this._stringTableContainer.handleClear();

                    break;
                case MessagePacketType.SVC_PACKET_ENTITIES:
                    // this._handleMessagePacketEntities(messagePacket.data);

                    break;
                case MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE:
                    break;
                default:
                    break;
            }
        });
    }

    _handleDemSendTables(messageData) {
        const bitBuffer = new BitBuffer(messageData.data);

        const size = bitBuffer.readUVarInt32();
        const payload = bitBuffer.read(size.value * BitBuffer.BITS_PER_BYTE);

        const decoded = CSVCMsg_FlattenedSerializer.decode(payload);

        const fields = [ ];

        decoded.fields.forEach((fieldRaw) => {
            const field = Field.parse(fieldRaw, decoded.symbols);

            fields.push(field);
        });

        decoded.serializers.forEach((serializerRaw) => {
            const serializerFields = serializerRaw.fieldsIndex.reduce((accumulator, fieldIndex) => {
                accumulator.push(fields[fieldIndex]);

                return accumulator;
            }, [ ]);

            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializer = new Serializer(name, version, serializerFields);

            const key = getSerializerKey(serializer.name, serializer.version);

            this._serializers.set(key, serializer);
        });
    }

    _handleMessageClassInfo(message) {

    }

    /**
     * @protected
     * @param {CSVCMsg_PacketEntities} message
     */
    _handleMessagePacketEntities(message) {
        const bitBuffer = new BitBuffer(message.entityData);

        if (message.legacyIsDelta) {
            //
        }

        let index = -1;

        // console.log(message);

        for (let i = 0; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.read(2)[0];

            switch (command) {
                case 0: { // Update
                    break;
                }
                case 1: { // Leave
                    break;
                }
                case 2: { // Create
                    const bufferForClassId = bitBuffer.read(this._server.classIdBitSize);
                    const bufferForSerial = bitBuffer.read(17);

                    const tailForClassId = Buffer.alloc(Math.floor((BitBuffer.BITS_PER_BYTE * 4 - this._server.classIdBitSize) / BitBuffer.BITS_PER_BYTE));
                    const tailForSerial = Buffer.alloc(1);

                    const ignored = bitBuffer.readUVarInt32();

                    const classId = Buffer.concat([ bufferForClassId, tailForClassId ]).readUInt32LE();
                    const serial = Buffer.concat([ bufferForSerial, tailForSerial ]).readUInt32LE();

                    const clazz = this._classes.byId.get(classId) || null

                    console.log(clazz);
                    console.log(serial);

                    throw new Error(123);

                    break;
                }
                case 3: { // Delete
                    break;
                }
            }
        }

        // throw new Error(1);

    }

    /**
     * @protected
     * @param {CSVCMsg_ServerInfo} message
     */
    _handleMessageServerInfo(message) {
        assert(Number.isInteger(message.maxClasses));
        assert(Number.isInteger(message.maxClients));

        this._server.maxClasses = message.maxClasses;
        this._server.maxClients = message.maxClients;

        this._server.classIdBitSize = Math.floor(Math.log2(message.maxClasses)) + 1;
    }
}

function getSerializerKey(name, version) {
    return `${name}|${version}`;
}

module.exports = DemoStreamPacketAnalyzer;
