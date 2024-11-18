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

const Server = require('./../data/Server');

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
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        this._parser.performanceTracker.start(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);
        this._parser.packetTracker.handleDemoPacket(demoPacket);

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
                this._parser.demo.stringTableContainer.handleInstantiate(demoPacket.data);

                break;
            case DemoCommandType.DEM_PACKET:
                this._handleDemPacket(demoPacket);

                break;
            case DemoCommandType.DEM_SIGNON_PACKET:
                this._handleDemPacket(demoPacket);

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
                this._handleDemPacket(demoPacket);

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

        this._parser.performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        callback();
    }

    /**
     * @protected
     * @param {CDemoClassInfo} classInfo
     */
    _handleDemClassInfo(classInfo) {
        classInfo.classes.forEach((data) => {
            const key = Serializer.GET_KEY(data.networkName, 0);

            const serializer = this._parser.demo.getSerializerByKey(key);

            if (serializer === null) {
                throw new Error(`Serializer not found [ ${key} ]`);
            }

            const clazz = new Class(data.classId, data.networkName, serializer);

            this._parser.demo.registerClass(clazz);
        });
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     */
    _handleDemPacket(demoPacket) {
        const messagePackets = demoPacket.data;

        messagePackets.forEach((messagePacket) => {
            this._parser.packetTracker.handleMessagePacket(demoPacket, messagePacket);

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
                    this._parser.demo.stringTableContainer.handleCreate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                    this._parser.demo.stringTableContainer.handleUpdate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                    this._parser.demo.stringTableContainer.handleClear();

                    break;
                case MessagePacketType.SVC_PACKET_ENTITIES:
                    this._handleMessagePacketEntities(messagePacket.data);

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

            this._parser.demo.registerSerializer(serializer);
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
                    if (this._parser.demo.server === null) {
                        throw new Error(`Server info not found`);
                    }

                    const classIdSizeBits = this._parser.demo.server.classIdSizeBits;

                    const bufferForClassId = bitBuffer.read(classIdSizeBits);
                    const bufferForSerial = bitBuffer.read(17);

                    const tailForClassId = Buffer.alloc(Math.floor((BitBuffer.BITS_PER_BYTE * 4 - classIdSizeBits) / BitBuffer.BITS_PER_BYTE));
                    const tailForSerial = Buffer.alloc(1);

                    const ignored = bitBuffer.readUVarInt32();

                    const classId = Buffer.concat([ bufferForClassId, tailForClassId ]).readUInt32LE();
                    const serial = Buffer.concat([ bufferForSerial, tailForSerial ]).readUInt32LE();

                    const clazz = this._parser.demo.getClassById(classId);

                    if (clazz === null) {
                        throw new Error(`Class not found [ ${classId} ]`);
                    }

                    // console.log(clazz);
                    // console.log(serial);

                    // throw new Error(123);

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
        const server = new Server(message.maxClasses, message.maxClients);

        this._parser.demo.registerServer(server);
    }
}

module.exports = DemoStreamPacketAnalyzer;
