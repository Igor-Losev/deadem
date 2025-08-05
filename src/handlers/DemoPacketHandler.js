import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';

import Class from '#data/Class.js';
import Demo from '#data/Demo.js';

import Field from '#data/fields/Field.js';
import FieldDecoderInstructionsFactory from '#data/fields/FieldDecoderInstructionsFactory.js';
import FieldDefinition from '#data/fields/FieldDefinition.js';
import Serializer from '#data/fields/Serializer.js';
import SerializerKey from '#data/fields/SerializerKey.js';

import ProtoProvider from '#providers/ProtoProvider.instance.js';

const CSVCMsg_FlattenedSerializer = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer');

class DemoPacketHandler {
    /**
     * @constructor
     * @param {Demo} demo
     */
    constructor(demo) {
        Assert.isTrue(demo instanceof Demo);

        this._demo = demo;

        this._instructionsFactory = new FieldDecoderInstructionsFactory();
    }

    /**
     * Handles a {@link DemoPacketType.DEM_SEND_TABLES} (ID = 4).
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

                    if (Object.hasOwn(fieldRaw, 'fieldSerializerNameSym') && Object.hasOwn(fieldRaw, 'fieldSerializerVersion')) {
                        const fieldSerializerNameSym = fieldRaw.fieldSerializerNameSym;

                        const serializerName = symbols[fieldSerializerNameSym];
                        const serializerVersion = fieldRaw.fieldSerializerVersion;

                        const serializerKey = new SerializerKey(serializerName, serializerVersion);

                        const existing = this._demo.getSerializerByKey(serializerKey);

                        if (existing === null) {
                            throw new Error(`Field [ ${symbols[fieldRaw.varNameSym]} ] has a serializer, but serializer [ ${serializerKey.toString()} ] is not registered`);
                        }

                        fieldSerializer = existing;
                    }

                    const varEncoderSym = fieldRaw.varEncoderSym;
                    const varNameSym = fieldRaw.varNameSym;
                    const varTypeSym = fieldRaw.varTypeSym;
                    const sendNodeSym = fieldRaw.sendNodeSym;

                    const name = symbols[varNameSym];
                    const definition = FieldDefinition.parse(symbols[varTypeSym]);

                    let encoder;

                    if (name === 'm_flSimulationTime') {
                        encoder = 'simtime';
                    } else if (typeof symbols[varEncoderSym] === 'string') {
                        encoder = symbols[varEncoderSym];
                    } else {
                        encoder = null;
                    }

                    const encodeFlags = Number.isInteger(fieldRaw.encodeFlags) ? fieldRaw.encodeFlags : null;
                    const bitCount = Number.isInteger(fieldRaw.bitCount) ? fieldRaw.bitCount : null;
                    const lowValue = Number.isInteger(fieldRaw.lowValue) ? fieldRaw.lowValue : null;
                    const highValue = Number.isInteger(fieldRaw.highValue) ? fieldRaw.highValue : null;

                    const decoderInstructions = this._instructionsFactory.build(
                        encoder,
                        encodeFlags,
                        bitCount,
                        lowValue,
                        highValue
                    );

                    const sendNode = symbols[sendNodeSym].split('.').filter(s => s.length > 0);

                    // TODO: polymorphic types

                    field = new Field(name, definition, sendNode, decoderInstructions, fieldSerializer);
                }

                serializer.push(field);

                fields.set(fieldIndex, field);
            });
        });
    }

    /**
     * Handles a {@link DemoPacketType.DEM_CLASS_INFO} (ID = 5).
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
     * Handles a {@link DemoPacketType.DEM_STRING_TABLES} (ID = 6).
     *
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemStringTables(demoPacket) {
        this._demo.stringTableContainer.handleInstantiate(demoPacket.data);
    }

    /**
     * Handles tables data from the {@link DemoPacketType.DEM_FULL_PACKET} (ID = 13).
     *
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemFullPacketTables(demoPacket) {
        this._demo.stringTableContainer.handleSnapshot(demoPacket.data.stringTables);
    }
}

export default DemoPacketHandler;
