import Assert from '#core/Assert.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

import ProtoProvider from '#providers/ProtoProvider.js';

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

        this._protos = {
            provider: protoProvider,
            demo: new Map(),
            message: new Map(),
            stringTableDecoders: new Map()
        };

        this._types = {
            demoById: new Map(),
            demoByCode: new Map(),
            messageById: new Map(),
            messageByCode: new Map(),
            stringTableByName: new Map()
        };

        this._serializers = {
            sendTables: null
        };
    }

    /**
     * Serializes the registry state into a plain object suitable for
     * cross-thread transfer via {@link postMessage}. Protobuf types are
     * referenced by their fullName; the receiver rebuilds them against
     * its own {@link protobuf.Root} built from the same schema.
     *
     * @public
     * @returns {Object}
     */
    export() {
        const demoTypes = [];
        const messageTypes = [];
        const stringTableTypes = [];
        const stringTableDecoders = [];

        this._types.demoById.forEach((type, id) => {
            const proto = this._protos.demo.get(id);

            demoTypes.push({
                id: type.id,
                code: type.code,
                heavy: type.heavy,
                bootstrap: type.bootstrap,
                protoName: proto.fullName
            });
        });

        this._types.messageById.forEach((type, id) => {
            const proto = this._protos.message.get(id);

            messageTypes.push({
                id: type.id,
                code: type.code,
                protoName: proto.fullName
            });
        });

        this._types.stringTableByName.forEach((type) => {
            stringTableTypes.push({
                code: type.code,
                name: type.name,
                synthesized: type.synthesized
            });
        });

        this._protos.stringTableDecoders.forEach((proto, name) => {
            stringTableDecoders.push({
                name,
                protoName: proto.fullName
            });
        });

        return {
            protoJson: this._protos.provider.schema,
            demoTypes,
            messageTypes,
            stringTableTypes,
            stringTableDecoders,
            sendTablesSerializerDecoder: this._serializers.sendTables ? this._serializers.sendTables.fullName : null
        };
    }

    /**
     * @public
     * @param {DemoPacketType} type
     * @returns {protobuf.Type|null}
     */
    getDemoProto(type) {
        return this._protos.demo.get(type.id) || null;
    }

    /**
     * @public
     * @returns {protobuf.Type|null}
     */
    getSendTablesSerializerDecoder() {
        return this._serializers.sendTables;
    }

    /**
     * @public
     * @param {MessagePacketType} type
     * @returns {protobuf.Type|null}
     */
    getMessageProto(type) {
        return this._protos.message.get(type.id) || null;
    }

    /**
     * @public
     * @returns {ProtoProvider}
     */
    getProtoProvider() {
        return this._protos.provider;
    }

    /**
     * @public
     * @param {StringTableType} type
     * @returns {protobuf.Type|null}
     */
    getStringTableDecoder(type) {
        return this._protos.stringTableDecoders.get(type.name) || null;
    }

    /**
     * @public
     * @param {DemoPacketType} type
     * @param {protobuf.Type} proto
     */
    registerDemoType(type, proto) {
        this._protos.demo.set(type.id, proto);
        this._types.demoById.set(type.id, type);
        this._types.demoByCode.set(type.code, type);
    }

    /**
     * @public
     * @param {MessagePacketType} type
     * @param {protobuf.Type} proto
     */
    registerMessageType(type, proto) {
        this._protos.message.set(type.id, proto);
        this._types.messageById.set(type.id, type);
        this._types.messageByCode.set(type.code, type);
    }

    /**
     * @public
     * @param {StringTableType} type
     * @param {protobuf.Type} proto
     */
    registerStringTableDecoder(type, proto) {
        this._protos.stringTableDecoders.set(type.name, proto);
    }

    /**
     * @public
     * @param {StringTableType} type
     */
    registerStringTableType(type) {
        this._types.stringTableByName.set(type.name, type);
    }

    /**
     * @public
     * @param {protobuf.Type} proto
     */
    setSendTablesSerializerDecoder(proto) {
        this._serializers.sendTables = proto;
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
     * @param {String} code
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
     * @param {String} code
     * @returns {MessagePacketType|null}
     */
    resolveMessageTypeByCode(code) {
        return this._types.messageByCode.get(code) || null;
    }

    /**
     * @public
     * @param {String} name
     * @returns {StringTableType|null}
     */
    resolveStringTableTypeByName(name) {
        return this._types.stringTableByName.get(name) || null;
    }

    /**
     * Reconstructs a {@link SchemaRegistry} from the snapshot. 
     *
     * @public
     * @static
     * @param {Object} snapshot
     * @returns {SchemaRegistry}
     */
    static reconstruct(snapshot) {
        const protoProvider = new ProtoProvider(snapshot.protoJson);

        const registry = new SchemaRegistry(protoProvider);

        snapshot.demoTypes.forEach(({ id, code, heavy, bootstrap, protoName }) => {
            const type = new DemoPacketType(code, id, heavy, bootstrap);

            registry.registerDemoType(type, protoProvider.root.lookupType(protoName));
        });

        snapshot.messageTypes.forEach(({ id, code, protoName }) => {
            const type = new MessagePacketType(code, id);

            registry.registerMessageType(type, protoProvider.root.lookupType(protoName));
        });

        snapshot.stringTableTypes.forEach(({ code, name, synthesized }) => {
            const type = new StringTableType(code, name, synthesized);

            registry.registerStringTableType(type);
        });

        snapshot.stringTableDecoders.forEach(({ name, protoName }) => {
            const type = registry._types.stringTableByName.get(name);

            if (!type) {
                throw new Error(`Cannot reconstruct stringTableDecoder: type not registered for [ ${name} ]`);
            }

            registry.registerStringTableDecoder(type, protoProvider.root.lookupType(protoName));
        });

        if (snapshot.sendTablesSerializerDecoder !== null) {
            registry.setSendTablesSerializerDecoder(protoProvider.root.lookupType(snapshot.sendTablesSerializerDecoder));
        }

        return registry;
    }
}

export default SchemaRegistry;
