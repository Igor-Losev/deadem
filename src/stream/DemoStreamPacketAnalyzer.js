'use strict';

const Stream = require('stream');

const BitBuffer = require('./../data/buffer/BitBufferFast');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const Field = require('./../data/fields/Field'),
    FieldDecoderInstructions = require('./../data/fields/FieldDecoderInstructions'),
    FieldDefinition = require('../data/fields/FieldDefinition'),
    Serializer = require('./../data/fields/Serializer'),
    SerializerKey = require('./../data/fields/SerializerKey');

const FieldPathExtractor = require('./../extractors/FieldPathExtractor');

const Class = require('../data/Class'),
    Entity = require('./../data/Entity'),
    Server = require('./../data/Server');

const ProtoProvider = require('./../providers/ProtoProvider.instance');

const CSVCMsg_FlattenedSerializer = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer');

/**
 * Given a stream of {@link DemoPacket}, processes them sequentially,
 * updating the state of the {@link Parser} accordingly.
 */
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
            case DemoCommandType.DEM_RECOVERY:
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
            const key = new SerializerKey(data.networkName, 0);
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
                case MessagePacketType.NET_SET_CON_VAR:
                case MessagePacketType.NET_SIGNON_STATE:
                case MessagePacketType.NET_SPAWN_GROUP_LOAD:
                case MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK:
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
                case MessagePacketType.SVC_VOICE_INIT:
                    break;
                case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                    this._parser.demo.stringTableContainer.handleClear();

                    break;
                case MessagePacketType.SVC_PACKET_ENTITIES:
                    this._handleMessagePacketEntities(messagePacket.data);

                    break;
                case MessagePacketType.SVC_HLTV_STATUS:
                    break;
                case MessagePacketType.SVC_USER_COMMANDS:
                    break;

                case MessagePacketType.USER_MESSAGE_PARTICLE_MANAGER:
                case MessagePacketType.USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL:
                    break;

                case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST:
                case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT:
                case MessagePacketType.GE_SOS_START_SOUND_EVENT:
                case MessagePacketType.GE_SOS_STOP_SOUND_EVENT:
                case MessagePacketType.GE_SOS_SET_SOUND_EVENT_PARAMS:
                    break;

                case MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE:
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * @protected
     * @param {CDemoSendTables} messageData
     */
    _handleDemSendTables(messageData) {
        const bitBuffer = new BitBuffer(messageData.data);

        const size = bitBuffer.readUVarInt32();
        const payload = bitBuffer.read(size * BitBuffer.BITS_PER_BYTE);

        const decoded = CSVCMsg_FlattenedSerializer.decode(payload);

        const fields = new Map();
        const symbols = decoded.symbols;

        const has = (target, key) => Object.hasOwn(target, key);
        const get = (value, predicate, fallback) => predicate(value) ? value : fallback;

        // Step 1: initialize serializers
        decoded.serializers.forEach((serializerRaw) => {
            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializer = new Serializer(name, version, [ ]);

            this._parser.demo.registerSerializer(serializer);
        });

        // Step 1: adding fields
        decoded.serializers.forEach((serializerRaw) => {
            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializerKey = new SerializerKey(name, version);

            const serializer = this._parser.demo.getSerializerByKey(serializerKey);

            serializerRaw.fieldsIndex.forEach((fieldIndex) => {
                let field = fields.get(fieldIndex) || null;

                if (field === null) {
                    const fieldRaw = decoded.fields[fieldIndex] || null;

                    if (fieldRaw === null) {
                        throw new Error(`fieldRaw with index [ ${fieldIndex} ] doesn't exist`);
                    }

                    let fieldSerializer = null;

                    if (has(fieldRaw, 'fieldSerializerNameSym') && has(fieldRaw, 'fieldSerializerVersion')) {
                        const serializerName = symbols[fieldRaw.fieldSerializerNameSym];
                        const serializerVersion = fieldRaw.fieldSerializerVersion;

                        const serializerKey = new SerializerKey(serializerName, serializerVersion);

                        const existing = this._parser.demo.getSerializerByKey(serializerKey);

                        if (existing === null) {
                            throw new Error(`Field [ ${symbols[fieldRaw.varNameSym]} ] has a serializer, but serializer [ ${serializerKey.toString()} ] is not registered`);
                        }

                        fieldSerializer = existing;
                    }

                    const name = symbols[fieldRaw.varNameSym];
                    const definition = FieldDefinition.parse(symbols[fieldRaw.varTypeSym]);

                    const decoderInstructions = new FieldDecoderInstructions(
                        get(symbols[fieldRaw.varEncoderSym], v => has(fieldRaw, 'varEncoderSym') && typeof v === 'string', null),
                        get(fieldRaw.encodeFlags, v => has(fieldRaw, 'encodeFlags') && Number.isInteger(v), null),
                        get(fieldRaw.bitCount, v => has(fieldRaw, 'bitCount') && Number.isInteger(v), null),
                        get(fieldRaw.lowValue, v => has(fieldRaw, 'lowValue') && typeof v === 'number', null),
                        get(fieldRaw.highValue, v => has(fieldRaw, 'highValue') && typeof v === 'number', null)
                    );

                    const sendNode = symbols[fieldRaw.sendNodeSym].split('.').filter(s => s.length > 0);

                    // TODO: polymorphic types

                    // patch
                    if ([
                        'm_flSimulationTime'
                    ].includes(name)) {
                        decoderInstructions.encoder = 'simtime';
                    }

                    field = new Field(name, definition, sendNode, decoderInstructions, fieldSerializer);
                }

                serializer.push(field);

                fields.set(fieldIndex, field);
            });
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
            // throw new Error(`Unhandled CSVCMsg_PacketEntities.legacyIsDelta === true`);
        }

        if (message.updateBaseline) {
            throw new Error('Unhandled CSVCMsg_PacketEntities.updateBaseline === true');
        }

        if (this._parser.demo.server === null) {
            throw new Error('CSVCMsg_PacketEntities found, but server data is missing');
        }

        let index = -1;

        for (let i = 0; i < message.updatedEntries; i++) {
            index += bitBuffer.readUVarInt() + 1;

            const command = bitBuffer.read(2)[0];

            switch (command) {
                case 0: { // Update
                    const entity = this._parser.demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    this._parser.performanceTracker.start(PerformanceTrackerCategory.ENTITY_UPDATE_READS);

                    readFields(bitBuffer, entity.class.serializer);

                    this._parser.performanceTracker.end(PerformanceTrackerCategory.ENTITY_UPDATE_READS);

                    break;
                }
                case 1: { // Leave
                    const entity = this._parser.demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    // TODO: entity.active ?

                    break;
                }
                case 2: { // Create
                    const classIdSizeBits = this._parser.demo.server.classIdSizeBits;

                    const bufferForClassId = bitBuffer.read(classIdSizeBits);
                    const bufferForSerial = bitBuffer.read(17);

                    const ignored = bitBuffer.readUVarInt32();

                    const classId = BitBuffer.readUInt32LE(bufferForClassId);
                    const serial = BitBuffer.readUInt32LE(bufferForSerial);

                    const clazz = this._parser.demo.getClassById(classId);

                    if (clazz === null) {
                        throw new Error(`Class not found [ ${classId} ]`);
                    }

                    const baseline = this._parser.demo.getClassBaselineById(classId);

                    if (baseline === null) {
                        throw new Error(`Baseline not found [ ${classId} ]`);
                    }

                    const entity = new Entity(index, serial, clazz);

                    this._parser.demo.registerEntity(entity);

                    this._parser.performanceTracker.start(PerformanceTrackerCategory.ENTITY_CREATE_READS);

                    readFields(new BitBuffer(baseline), clazz.serializer);
                    readFields(bitBuffer, clazz.serializer);

                    this._parser.performanceTracker.end(PerformanceTrackerCategory.ENTITY_CREATE_READS);

                    // ---- TODO: Update entity state

                    break;
                }
                case 3: { // Delete
                    const entity = this._parser.demo.getEntity(index);

                    if (entity === null) {
                        throw new Error(`Unable to find an entity with index [ ${index} ]`);
                    }

                    // TODO: entity.active ?

                    const deleted = this._parser.demo.deleteEntity(index);

                    if (deleted === null) {
                        throw new Error(`Received delete entity command. However, entity with index [ ${index} ] doesn't exist`);
                    }

                    break;
                }
            }
        }
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

function readFields(bitBuffer, serializer) {
    const extractor = new FieldPathExtractor(bitBuffer);
    const generator = extractor.retrieve();

    const fieldPaths = [ ];

    for (const fieldPath of generator) {
        fieldPaths.push(fieldPath);
    }

    fieldPaths.forEach((fieldPath) => {
        const decoder = serializer.getDecoderForFieldPath(fieldPath);

        const value = decoder.decode(bitBuffer);
    });
}

module.exports = DemoStreamPacketAnalyzer;
