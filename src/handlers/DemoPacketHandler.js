'use strict';

const assert = require('assert/strict');

const Class = require('./../data/Class'),
    Demo = require('./../data/Demo');

const BitBuffer = require('./../data/buffer/BitBufferFast');

const Field = require('./../data/fields/Field'),
    FieldDecoderInstructions = require('./../data/fields/FieldDecoderInstructions'),
    FieldDefinition = require('../data/fields/FieldDefinition'),
    Serializer = require('./../data/fields/Serializer'),
    SerializerKey = require('./../data/fields/SerializerKey');

const ProtoProvider = require('./../providers/ProtoProvider.instance');

const CSVCMsg_FlattenedSerializer = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer');

class DemoPacketHandler {
    /**
     * @constructor
     * @param {Demo} demo
     */
    constructor(demo) {
        assert(demo instanceof Demo);

        this._demo = demo;
    }

    /**
     * Handles a {@link DemoCommandType.DEM_SEND_TABLES} (ID = 4).
     *
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemSendTables(demoPacket) {
        const message = demoPacket.data;

        const bitBuffer = new BitBuffer(message.data);

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

            this._demo.registerSerializer(serializer);
        });

        // Step 2: adding fields
        decoded.serializers.forEach((serializerRaw) => {
            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializerKey = new SerializerKey(name, version);

            const serializer = this._demo.getSerializerByKey(serializerKey);

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

                        const existing = this._demo.getSerializerByKey(serializerKey);

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

    /**
     * Handles a {@link DemoCommandType.DEM_CLASS_INFO} (ID = 5).
     *
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemClassInfo(demoPacket) {
        const classInfo = demoPacket.data;

        classInfo.classes.forEach((data) => {
            const key = new SerializerKey(data.networkName, 0);
            const serializer = this._demo.getSerializerByKey(key);

            if (serializer === null) {
                throw new Error(`Serializer not found [ ${key} ]`);
            }

            const clazz = new Class(data.classId, data.networkName, serializer);

            this._demo.registerClass(clazz);
        });
    }

    /**
     * Handles a {@link DemoCommandType.DEM_STRING_TABLES} (ID = 6).
     *
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemStringTables(demoPacket) {
        this._demo.stringTableContainer.handleInstantiate(demoPacket.data);
    }
}

module.exports = DemoPacketHandler;
