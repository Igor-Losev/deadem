/** @import DemoPacket from '../data/DemoPacket.js' */

import Assert from '../core/Assert.js';
import BitBuffer from '../core/BitBuffer.js';

import Class from '../data/Class.js';
import Demo from '../data/Demo.js';

import Field from '../data/fields/Field.js';
import FieldDefinition from '../data/fields/FieldDefinition.js';
import FieldFactory from '../data/fields/FieldFactory.js';
import Serializer from '../data/fields/Serializer.js';
import SerializerKey from '../data/fields/SerializerKey.js';

import StringTableHandler from './StringTableHandler.js';

import SchemaRegistry from '../SchemaRegistry.js';

class DemoPacketHandler {
    /**
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {Demo} demo
     * @param {StringTableHandler} stringTableHandler
     */
    constructor(registry, demo, stringTableHandler) {
        Assert.isTrue(registry instanceof SchemaRegistry);
        Assert.isTrue(demo instanceof Demo);
        Assert.isTrue(stringTableHandler instanceof StringTableHandler);

        /** @private */
        this._registry = registry;
        /** @private */
        this._demo = demo;
        /** @private */
        this._stringTableHandler = stringTableHandler;

        /** @private */
        this._fieldFactory = new FieldFactory(registry.getFieldRuleRegistry());
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

        const sendTablesDecoder = this._registry.getSendTablesSerializerDecoder();

        Assert.exists(sendTablesDecoder, 'SendTables serializer decoder is not registered');

        const decoded = sendTablesDecoder.decode(payload);

        const fields = new Map();
        const symbols = decoded.symbols;

        // Step 1: initialize serializers
        decoded.serializers.forEach((/** @type {*} */ serializerRaw) => {
            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializer = new Serializer(name, version, [ ]);

            this._demo.registerSerializer(serializer);
        });

        // Step 2: adding fields
        decoded.serializers.forEach((/** @type {*} */ serializerRaw) => {
            const name = decoded.symbols[serializerRaw.serializerNameSym];
            const version = serializerRaw.serializerVersion;

            const serializerKey = new SerializerKey(name, version);

            const serializer = this._demo.getSerializerByKey(serializerKey);

            Assert.exists(serializer, `Serializer [ ${serializerKey.toString()} ] is not registered`);

            serializerRaw.fieldsIndex.forEach((/** @type {number} */ fieldIndex) => {
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

                        const fieldSerializerKey = new SerializerKey(serializerName, serializerVersion);

                        const existing = this._demo.getSerializerByKey(fieldSerializerKey);

                        if (existing === null) {
                            throw new Error(`Field [ ${symbols[fieldRaw.varNameSym]} ] has a serializer, but serializer [ ${fieldSerializerKey.toString()} ] is not registered`);
                        }

                        fieldSerializer = existing;
                    }

                    const varNameSym = fieldRaw.varNameSym;
                    const varTypeSym = fieldRaw.varTypeSym;
                    const sendNodeSym = fieldRaw.sendNodeSym;

                    const varName = symbols[varNameSym];
                    const definition = FieldDefinition.parse(symbols[varTypeSym]);

                    const instructionsRaw = {
                        encoder: Object.hasOwn(fieldRaw, 'varEncoderSym') ? symbols[fieldRaw.varEncoderSym] : null,
                        encoderFlags: Object.hasOwn(fieldRaw, 'encodeFlags') ? fieldRaw.encodeFlags : null,
                        bitCount: Object.hasOwn(fieldRaw, 'bitCount') ? fieldRaw.bitCount : null,
                        valueLow: Object.hasOwn(fieldRaw, 'lowValue') ? fieldRaw.lowValue : null,
                        valueHigh: Object.hasOwn(fieldRaw, 'highValue') ? fieldRaw.highValue : null
                    };

                    const sendNode = parseSendNode(symbols[sendNodeSym]);

                    // TODO: polymorphic types

                    field = this._fieldFactory.create(sendNode, varName, definition, instructionsRaw, fieldSerializer);
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

        classInfo.classes.forEach((/** @type {*} */ data) => {
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
        this._stringTableHandler.handleInstantiate(demoPacket.data);
    }
}

const IGNORED_SEND_NODE_SEGMENTS = new Set([ '(root)' ]); // '(root)' comes from older dota2 demos.

/**
 * @param {string} symbol
 * @returns {Array<string>}
 */
function parseSendNode(symbol) {
    return Field.splitName(symbol).filter(segment => segment.length > 0 && !IGNORED_SEND_NODE_SEGMENTS.has(segment));
}

export default DemoPacketHandler;
