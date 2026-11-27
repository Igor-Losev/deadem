/** @import { Message } from '@bufbuild/protobuf' */
/** @import { DemoPacketHeavyData } from '../data/DemoPacket.js' */

import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

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

const SNAPPY_COMPRESSION_THRESHOLD_BYTES = 512;

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
     * Creates a protobuf message for a demo packet type.
     *
     * @public
     * @param {DemoPacketType} demoPacketType
     * @param {Record<string, *>} [fields]
     * @returns {Message}
     */
    createDemoPacketMessage(demoPacketType, fields) {
        Assert.isTrue(demoPacketType instanceof DemoPacketType, 'Invalid demoPacketType: expected an instance of DemoPacketType');
        Assert.isTrue(demoPacketType.protoName !== null, `Unable to create message for packet [ ${demoPacketType.id} ]: unknown type`);

        return create(this._registry.getDescriptor(demoPacketType.protoName), fields);
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

        const raw = this._createDemoPacketRaw(demoPacket.sequence, demoPacket.type.id, DemoSource.REPLAY, demoPacket.tick, this._encodeDemoPacketData(demoPacket));

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
     * Returns a copy of the packet with the message as its payload.
     *
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {Message} message - Of the type of the packet.
     * @returns {DemoPacketRaw}
     */
    repackDemoPacketRaw(demoPacketRaw, message) {
        Assert.isTrue(demoPacketRaw.source !== DemoSource.HTTP_BROADCAST, `Unable to repack packet [ ${demoPacketRaw.getTypeId()} ]: broadcast is not supported`);

        const demoPacketType = this._resolveDemoType(demoPacketRaw.getTypeId());

        Assert.isTrue(demoPacketType !== null && demoPacketType.protoName === message.$typeName, `Unable to repack [ ${message.$typeName} ] into packet [ ${demoPacketRaw.getTypeId()} ]: another type`);

        const raw = this._createDemoPacketRaw(demoPacketRaw.sequence, demoPacketType.id, demoPacketRaw.source, demoPacketRaw.tick.value, toBinary(this._registry.getDescriptor(message.$typeName), message));

        raw.ordinal = demoPacketRaw.ordinal;

        return raw;
    }

    /**
     * Returns the protobuf message of the payload. Keeps the fields the schema does not know.
     *
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {*}
     */
    unpackDemoPacketRaw(demoPacketRaw) {
        Assert.isTrue(demoPacketRaw.source !== DemoSource.HTTP_BROADCAST, `Unable to unpack packet [ ${demoPacketRaw.getTypeId()} ]: broadcast is not supported`);

        const demoPacketType = this._resolveDemoType(demoPacketRaw.getTypeId());

        Assert.isTrue(demoPacketType !== null && demoPacketType.protoName !== null, `Unable to unpack packet [ ${demoPacketRaw.getTypeId()} ]: unknown type`);

        let payload;

        if (demoPacketRaw.getIsCompressed()) {
            payload = Snappy.decompress(demoPacketRaw.payload);
        } else {
            payload = demoPacketRaw.payload;
        }

        return fromBinary(this._registry.getDescriptor(demoPacketType.protoName), payload);
    }

    /**
     * @private
     * @param {number} sequence
     * @param {number} typeId
     * @param {DemoSource} source
     * @param {number} tick
     * @param {Uint8Array} payload - Uncompressed.
     * @returns {DemoPacketRaw}
     */
    _createDemoPacketRaw(sequence, typeId, source, tick, payload) {
        let type = typeId;
        let body = payload;

        if (payload.length > SNAPPY_COMPRESSION_THRESHOLD_BYTES) {
            const compressed = Snappy.compress(payload);

            if (compressed.length < payload.length) {
                type = typeId | DemoPacketRaw.COMPRESSED_FLAG;
                body = compressed;
            }
        }

        return new DemoPacketRaw(sequence, new VarInt32(type), source, new VarInt32(tick), new VarInt32(body.length), body);
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
    _encodeDemoPacketData(demoPacket) {
        const protoName = demoPacket.type.protoName;

        Assert.isTrue(protoName !== null, `Unable to encode packet [ ${demoPacket.type.id} ]: unknown type`);

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

        Assert.isTrue(protoName !== null, `Unable to encode message [ ${messagePacket.type.id} ]: unknown type`);

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
