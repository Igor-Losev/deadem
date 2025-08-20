import Assert from '#core/Assert.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import DemoSource from '#data/enums/DemoSource.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {DemoPacketType} type
     * @param {number} tick
     * @param {*} data
     */
    constructor(sequence, type, tick, data) {
        Assert.isTrue(Number.isInteger(sequence));
        Assert.isTrue(type instanceof DemoPacketType);
        Assert.isTrue(Number.isInteger(tick));

        this._sequence = sequence;
        this._type = type;
        this._tick = tick;
        this._data = data;
    }

    /**
     * @public
     * @returns {number}
     */
    get sequence() {
        return this._sequence;
    }

    /**
     * @public
     * @returns {DemoPacketType}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {number}
     */
    get tick() {
        return this._tick;
    }

    /**
     * @public
     * @returns {*}
     */
    get data() {
        return this._data;
    }

    /**
     * @static
     * @public
     * @param {DemoPacketObject} object
     * @returns {DemoPacket}
     */
    static fromObject(object) {
        return new DemoPacket(
            object.sequence,
            DemoPacketType.parse(object.type),
            object.tick,
            object.data
        );
    }

    /**
     * @static
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {DemoPacket|null}
     */
    static parse(demoPacketRaw) {
        const demoPacketType = DemoPacketType.parseById(demoPacketRaw.getTypeId());

        if (demoPacketType === null) {
            return null;
        }

        let decompressed;

        if (demoPacketRaw.getIsCompressed()) {
            decompressed = SnappyDecompressor.decompress(demoPacketRaw.payload);
        } else {
            decompressed = demoPacketRaw.payload;
        }

        let decoded;

        if (demoPacketRaw.source === DemoSource.HTTP_BROADCAST && (demoPacketType.heavy || demoPacketType === DemoPacketType.DEM_SPAWN_GROUPS)) {
            if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
                throw new Error('Unhandled [ DEM_FULL_PACKET ] packet for source [ HTTP_BROADCAST ]');
            }

            decoded = { data: decompressed };
        } else {
            decoded = demoPacketType.proto.decode(decompressed);
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

            const messagePackets = messagePacketsRaw.map(messagePacketRaw => MessagePacket.parse(messagePacketRaw) || messagePacketRaw);

            demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, createDemoPacketData(messagePackets, stringTables));
        } else {
            demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, decoded);
        }

        return demoPacket;
    }

    /**
     * Determines whether this is the initial packet at the start of the demo.
     *
     * In Source 2 demos, the initial packet typically contains the baseline state
     * of the world or entities before any updates occur.
     *
     * @public
     * @returns {boolean} `true` if this is the initial demo packet (tick === -1).
     */
    getIsInitial() {
        return this._tick === -1;
    }

    /**
     * @public
     * @returns {DemoPacketObject}
     */
    toObject() {
        return {
            sequence: this._sequence,
            type: this._type.code,
            tick: this._tick,
            data: this._data
        };
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

/**
 * @typedef {{sequence: number, type: String, tick: number, data: *}} DemoPacketObject
 */

export default DemoPacket;
