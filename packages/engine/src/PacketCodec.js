import Assert from '#core/Assert.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import DemoPacket from '#data/DemoPacket.js';
import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import DemoSource from '#data/enums/DemoSource.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import SchemaRegistry from './SchemaRegistry.js';

/**
 * Bridges the schema-aware decoding of {@link DemoPacketRaw} into
 * domain objects ({@link DemoPacket}, {@link MessagePacket}). Keeps the
 * raw and domain value objects free of registry coupling.
 */
class PacketCodec {
    /**
     * @public
     * @constructor
     * @param {SchemaRegistry} registry
     */
    constructor(registry) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');

        this._registry = registry;
    }

    /**
     * Decompresses and protobuf-decodes the raw payload.
     *
     * @public
     * @param {DemoPacketRaw} raw
     * @returns {*|null}
     */
    decodeRaw(raw) {
        const demoPacketType = this.getDemoType(raw);

        if (demoPacketType === null) {
            return null;
        }

        let decompressed;

        if (raw.getIsCompressed()) {
            decompressed = SnappyDecompressor.decompress(raw.payload);
        } else {
            decompressed = raw.payload;
        }

        if (raw.source === DemoSource.HTTP_BROADCAST && (demoPacketType.heavy || demoPacketType === DemoPacketType.DEM_SPAWN_GROUPS)) {
            if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
                throw new Error('Unhandled [ DEM_FULL_PACKET ] packet for source [ HTTP_BROADCAST ]');
            }

            return { data: decompressed };
        }

        const proto = this._registry.getDemoProto(demoPacketType);

        if (proto === null) {
            return null;
        }

        return proto.decode(decompressed);
    }

    /**
     * @public
     * @param {DemoPacketRaw} raw
     * @returns {DemoPacketType|null}
     */
    getDemoType(raw) {
        return this._registry.resolveDemoType(raw.getTypeId());
    }

    /**
     * Whether the raw packet is an initial bootstrap packet.
     *
     * @public
     * @param {DemoPacketRaw} raw
     * @returns {boolean}
     */
    getIsBootstrap(raw) {
        const type = this.getDemoType(raw);

        return raw.getIsInitial() && type !== null && type.bootstrap;
    }

    /**
     * @public
     * @param {DemoPacketRaw} raw
     * @param {function(number): boolean} [messagePacketFilter]
     * @returns {DemoPacket|null}
     */
    parseDemoPacket(raw, messagePacketFilter) {
        const demoPacketType = this.getDemoType(raw);

        if (demoPacketType === null) {
            return null;
        }

        const decoded = this.decodeRaw(raw);

        if (decoded === null) {
            return null;
        }

        let demoPacket;

        if (demoPacketType.heavy) {
            let messagePacketsRaw;
            let stringTables;

            if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
                messagePacketsRaw = new MessagePacketRawExtractor(decoded.packet.data).all();
                stringTables = decoded.stringTable;
            } else {
                messagePacketsRaw = new MessagePacketRawExtractor(decoded.data).all();
                stringTables = null;
            }

            if (messagePacketFilter) {
                messagePacketsRaw = messagePacketsRaw.filter(r => messagePacketFilter(r.type));
            }

            const messagePackets = messagePacketsRaw.map(r => this.parseMessagePacket(r) || r);

            demoPacket = new DemoPacket(raw.sequence, demoPacketType, raw.tick.value, createDemoPacketData(messagePackets, stringTables));
        } else {
            demoPacket = new DemoPacket(raw.sequence, demoPacketType, raw.tick.value, decoded);
        }

        demoPacket.ordinal = raw.ordinal;

        return demoPacket;
    }

    /**
     * @public
     * @param {MessagePacketRaw} raw
     * @returns {MessagePacket|null}
     */
    parseMessagePacket(raw) {
        const messagePacketType = this._registry.resolveMessageType(raw.type);

        if (messagePacketType === null) {
            return null;
        }

        const proto = this._registry.getMessageProto(messagePacketType);

        if (proto === null) {
            return null;
        }

        let data;

        try {
            data = proto.decode(raw.payload);
        } catch {
            return null;
        }

        return new MessagePacket(messagePacketType, data);
    }
}

/**
 * @param {Array<MessagePacket|MessagePacketRaw>} messagePackets
 * @param {CDemoStringTables|null} stringTables
 */
function createDemoPacketData(messagePackets, stringTables = null) {
    return {
        messagePackets,
        stringTables
    };
}

export default PacketCodec;
