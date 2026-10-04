/** @import FieldDecoderDescriptor from './data/fields/decoding/FieldDecoderDescriptor.js' */
/** @import { StringTableDecoderFn } from './data/tables/string/StringTable.js' */

/** @import DemoPacketType from './data/enums/DemoPacketType.js' */
/** @import MessagePacketType from './data/enums/MessagePacketType.js' */
/** @import StringTableType from './data/enums/StringTableType.js' */

import Assert from './core/Assert.js';

import FieldRuleRegistry from './data/fields/FieldRuleRegistry.js';

import ProtoProvider from './providers/ProtoProvider.js';

/**
 * Instance-based registry that owns the mapping from engine-level type identities
 * (DemoPacketType, MessagePacketType, StringTableType) to their protobuf types,
 * together with id/code lookups.
 *
 * Populated at startup by bootstrap functions. Each parser owns its own
 * {@link SchemaRegistry}, which allows multiple games to coexist in a single
 * process without type-id collisions.
 */
class SchemaRegistry {
    /**
     * @public
     * @constructor
     * @param {ProtoProvider} protoProvider
     */
    constructor(protoProvider) {
        Assert.isTrue(protoProvider instanceof ProtoProvider, 'Invalid protoProvider: expected an instance of ProtoProvider');

        /** @private */
        this._provider = protoProvider;

        /** @private @type {SchemaRegistryDecoders} */
        this._decoders = {
            demo: new Map(),
            message: new Map(),
            stringTables: new Map(),
            sendTables: null,
            userCommand: null
        };

        /** @private @type {SchemaRegistryTypes} */
        this._types = {
            demoById: new Map(),
            demoByCode: new Map(),
            messageById: new Map(),
            messageByCode: new Map(),
            stringTableByName: new Map()
        };

        /** @private */
        this._fieldRules = new FieldRuleRegistry();
    }

    /**
     * @public
     * @param {DemoPacketType} type
     * @returns {protobuf.Type|null}
     */
    getDemoDecoder(type) {
        return this._decoders.demo.get(type.id) || null;
    }

    /**
     * @public
     * @returns {FieldRuleRegistry}
     */
    getFieldRuleRegistry() {
        return this._fieldRules;
    }

    /**
     * @public
     * @param {MessagePacketType} type
     * @returns {protobuf.Type|null}
     */
    getMessageDecoder(type) {
        return this._decoders.message.get(type.id) || null;
    }

    /**
     * @public
     * @returns {ProtoProvider}
     */
    getProtoProvider() {
        return this._provider;
    }

    /**
     * @public
     * @returns {protobuf.Type|null}
     */
    getSendTablesSerializerDecoder() {
        return this._decoders.sendTables;
    }

    /**
     * @public
     * @param {StringTableType} type
     * @returns {StringTableDecoderFn|null}
     */
    getStringTableDecoder(type) {
        return this._decoders.stringTables.get(type.name) || null;
    }

    /**
     * @public
     * @returns {protobuf.Type|null}
     */
    getUserCommandDecoder() {
        return this._decoders.userCommand;
    }

    /**
     * @public
     * @param {DemoPacketType} type
     * @param {protobuf.Type} decoder
     */
    registerDemoType(type, decoder) {
        this._decoders.demo.set(type.id, decoder);
        this._types.demoById.set(type.id, type);
        this._types.demoByCode.set(type.code, type);
    }

    /**
     * @public
     * @param {string} name
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldDecoderOverride(name, descriptor) {
        this._fieldRules.registerFieldDecoderOverride(name, descriptor);
    }

    /**
     * @public
     * @param {string} name
     * @param {string} encoder
     */
    registerFieldEncoderOverride(name, encoder) {
        this._fieldRules.registerFieldEncoderOverride(name, encoder);
    }

    /**
     * @public
     * @param {string} baseType
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldTypeDecoder(baseType, descriptor) {
        this._fieldRules.registerFieldTypeDecoder(baseType, descriptor);
    }

    /**
     * @public
     * @param {string} baseType
     */
    registerFixedTableType(baseType) {
        this._fieldRules.registerFixedTableType(baseType);
    }

    /**
     * @public
     * @param {MessagePacketType} type
     * @param {protobuf.Type} decoder
     */
    registerMessageType(type, decoder) {
        this._decoders.message.set(type.id, decoder);
        this._types.messageById.set(type.id, type);
        this._types.messageByCode.set(type.code, type);
    }

    /**
     * @public
     * @param {StringTableType} type
     * @param {StringTableDecoderFn|null} [decoder]
     */
    registerStringTableType(type, decoder = null) {
        this._types.stringTableByName.set(type.name, type);

        if (decoder !== null) {
            this._decoders.stringTables.set(type.name, decoder);
        }
    }

    /**
     * @public
     * @param {string} baseType
     */
    registerVariableArrayType(baseType) {
        this._fieldRules.registerVariableArrayType(baseType);
    }

    /**
     * @public
     * @param {protobuf.Type} decoder
     */
    setSendTablesSerializerDecoder(decoder) {
        this._decoders.sendTables = decoder;
    }

    /**
     * @public
     * @param {protobuf.Type} decoder
     */
    setUserCommandDecoder(decoder) {
        this._decoders.userCommand = decoder;
    }

    /**
     * @public
     * @param {number} id
     * @returns {DemoPacketType|null}
     */
    resolveDemoType(id) {
        return this._types.demoById.get(id) || null;
    }

    /**
     * @public
     * @param {string} code
     * @returns {DemoPacketType|null}
     */
    resolveDemoTypeByCode(code) {
        return this._types.demoByCode.get(code) || null;
    }

    /**
     * @public
     * @param {number} id
     * @returns {MessagePacketType|null}
     */
    resolveMessageType(id) {
        return this._types.messageById.get(id) || null;
    }

    /**
     * @public
     * @param {string} code
     * @returns {MessagePacketType|null}
     */
    resolveMessageTypeByCode(code) {
        return this._types.messageByCode.get(code) || null;
    }

    /**
     * @public
     * @param {string} name
     * @returns {StringTableType|null}
     */
    resolveStringTableTypeByName(name) {
        return this._types.stringTableByName.get(name) || null;
    }
}

/**
 * @typedef {{ demoById: Map<number, DemoPacketType>, demoByCode: Map<string, DemoPacketType>, messageById: Map<number, MessagePacketType>, messageByCode: Map<string, MessagePacketType>, stringTableByName: Map<string, StringTableType> }} SchemaRegistryTypes
 *
 * @typedef {{ demo: Map<number, protobuf.Type>, message: Map<number, protobuf.Type>, stringTables: Map<string, StringTableDecoderFn>, sendTables: protobuf.Type|null, userCommand: protobuf.Type|null }} SchemaRegistryDecoders
 */

export default SchemaRegistry;
