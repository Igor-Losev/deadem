/** @import { DemoPacketHeavyData } from '../data/DemoPacket.js' */

import Assert from '../core/Assert.js';
import Snappy from '../core/Snappy.instance.js';

import DemoPacket from '../data/DemoPacket.js';
import DemoPacketRaw from '../data/DemoPacketRaw.js';
import MessagePacket from '../data/MessagePacket.js';
import MessagePacketRaw from '../data/MessagePacketRaw.js';
import VarInt32 from '../data/VarInt32.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';
import DemoSource from '../data/enums/DemoSource.js';

import MessagePacketRawExtractor from '../extractors/MessagePacketRawExtractor.js';

import MessagePacketRawWriter from '../writers/MessagePacketRawWriter.js';

import SchemaRegistry from './SchemaRegistry.js';

/**
 * Encodes / decodes:
 *  - {@link DemoPacketRaw} <--> {@link DemoPacket}
 *  - {@link MessagePacketRaw} <--> {@link MessagePacket}
 *
 * and their internals based on {@link SchemaRegistry}.
 */
class PacketCodec {
    /** @private @type {SchemaRegistry} */
    _registry;

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
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {((typeId: number) => boolean)|null} [messagePacketFilter=null]
     * @returns {DemoPacket|null}
     */
    decodeDemoPacketRaw(demoPacketRaw, messagePacketFilter = null) {
        const demoPacketType = this._resolveDemoType(demoPacketRaw.getTypeId());

        if (demoPacketType === null) {
            return null;
        }

        const decoded = this._decodeDemoPacketRawPayload(demoPacketRaw);

        if (decoded === null) {
            return null;
        }

        /** @type {*} */
        let data = decoded;

        if (demoPacketType.heavy) {
            /** @type {Uint8Array} */
            let messageBytes;
            /** @type {*} */
            let stringTables;

            if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
                messageBytes = decoded.packet.data;
                stringTables = decoded.stringTable;
            } else {
                messageBytes = decoded.data;
                stringTables = null;
            }

            const messagePacketsRaw = new MessagePacketRawExtractor(messageBytes).all(messagePacketFilter);
            const messagePackets = this._decodeMessagePacketsRaw(messagePacketsRaw);

            data = { messagePackets, stringTables };
        }

        const demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, data);

        demoPacket.ordinal = demoPacketRaw.ordinal;

        return demoPacket;

    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     * @returns {DemoPacketRaw}
     */
    encodeDemoPacket(demoPacket) {
        Assert.isTrue(demoPacket instanceof DemoPacket, 'Invalid packet: expected an instance of DemoPacket');

        const payload = Snappy.compress(this._encodeDemoPacketPayload(demoPacket));
        const typeId = demoPacket.type.id | DemoPacketRaw.COMPRESSED_FLAG;

        const raw = new DemoPacketRaw(
            demoPacket.sequence,
            new VarInt32(typeId, VarInt32.getSize(typeId)),
            DemoSource.REPLAY,
            new VarInt32(demoPacket.tick, VarInt32.getSize(demoPacket.tick)),
            new VarInt32(payload.length, VarInt32.getSize(payload.length)),
            payload
        );

        raw.ordinal = demoPacket.ordinal;

        return raw;
    }

    /**
     * Whether the packet is an initial bootstrap packet.
     *
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {boolean}
     */
    getIsBootstrap(demoPacketRaw) {
        const demoPacketType = this._resolveDemoType(demoPacketRaw.getTypeId());

        return demoPacketRaw.getIsInitial() && demoPacketType !== null && demoPacketType.bootstrap;
    }

    /**
     * @private
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {*|null}
     */
    _decodeDemoPacketRawPayload(demoPacketRaw) {
        const demoPacketType = this._resolveDemoType(demoPacketRaw.getTypeId());

        if (demoPacketType === null) {
            return null;
        }

        const decoder = this._registry.getDemoDecoder(demoPacketType);

        if (decoder === null) {
            return null;
        }

        let payload;

        if (demoPacketRaw.getIsCompressed()) {
            payload = Snappy.decompress(demoPacketRaw.payload);
        } else {
            payload = demoPacketRaw.payload;
        }

        if (demoPacketRaw.source.getIsUnwrapped(demoPacketType)) {
            return { data: payload };
        }

        return decoder.decode(payload);
    }

    /**
     * @private
     * @param {MessagePacketRaw} messagePacketRaw
     * @returns {MessagePacket|null}
     */
    _decodeMessagePacketRaw(messagePacketRaw) {
        const messagePacketType = this._registry.resolveMessageType(messagePacketRaw.type);

        if (messagePacketType === null) {
            return null;
        }

        const decoder = this._registry.getMessageDecoder(messagePacketType);

        if (decoder === null) {
            return null;
        }

        try {
            return new MessagePacket(messagePacketType, decoder.decode(messagePacketRaw.payload));
        } catch {
            return null;
        }
    }

    /**
     * @private
     * @param {Array<MessagePacketRaw>} messagePacketsRaw
     * @returns {Array<MessagePacket|MessagePacketRaw>}
     */
    _decodeMessagePacketsRaw(messagePacketsRaw) {
        return messagePacketsRaw.map(p => this._decodeMessagePacketRaw(p) ?? p);
    }

    /**
     * @private
     * @param {DemoPacket} demoPacket
     * @returns {Uint8Array}
     */
    _encodeDemoPacketPayload(demoPacket) {
        const protoName = demoPacket.type.protoName;

        Assert.isTrue(protoName !== null, `Unable to compress packet [ ${demoPacket.type.id} ]: unknown type`);

        const encoder = this._registry.getEncoder(protoName);

        let encoded;

        if (demoPacket.type.heavy) {
            const data = /** @type {DemoPacketHeavyData} */ (demoPacket.data);

            const messagePacketsRaw = this._encodeMessagePackets(data.messagePackets);
            const bytes = new MessagePacketRawWriter(messagePacketsRaw).all();

            if (demoPacket.is(DemoPacketType.DEM_FULL_PACKET)) {
                encoded = encoder.encode({ packet: { data: bytes }, stringTable: data.stringTables });
            } else {
                encoded = encoder.encode({ data: bytes });
            }
        } else {
            encoded = encoder.encode(/** @type {*} */ (demoPacket.data));
        }

        return encoded;
    }

    /**
     * @private
     * @param {MessagePacket} messagePacket
     * @returns {MessagePacketRaw}
     */
    _encodeMessagePacket(messagePacket) {
        const protoName = messagePacket.type.protoName;

        Assert.isTrue(protoName !== null, `Unable to compress message [ ${messagePacket.type.id} ]: unknown type`);

        const payload = this._registry.getEncoder(protoName).encode(/** @type {*} */ (messagePacket.data));

        return new MessagePacketRaw(messagePacket.type.id, payload.length, payload);
    }

    /**
     * @private
     * @param {Array<MessagePacket|MessagePacketRaw>} messagePackets
     * @returns {Array<MessagePacketRaw>}
     */
    _encodeMessagePackets(messagePackets) {
        return messagePackets.map(mp => mp instanceof MessagePacketRaw ? mp : this._encodeMessagePacket(mp));
    }

    /**
     * @private
     * @param {number} typeId
     * @returns {DemoPacketType|null}
     */
    _resolveDemoType(typeId) {
        return this._registry.resolveDemoType(typeId);
    }
}

export default PacketCodec;
