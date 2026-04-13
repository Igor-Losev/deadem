import Assert from '#core/Assert.js';

import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';

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
        this._ordinal = sequence;
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
     * @returns {number}
     */
    get ordinal() {
        return this._ordinal;
    }

    /**
     * @public
     * @param {number} value
     */
    set ordinal(value) {
        this._ordinal = value;
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
     * @param {function(number): boolean} [messagePacketFilter]
     * @returns {DemoPacket|null}
     */
    static parse(demoPacketRaw, messagePacketFilter) {
        const demoPacketType = demoPacketRaw.getType();

        if (demoPacketType === null) {
            return null;
        }

        const decoded = demoPacketRaw.decode();

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
                messagePacketsRaw = messagePacketsRaw.filter(raw => messagePacketFilter(raw.type));
            }

            const messagePackets = messagePacketsRaw.map(messagePacketRaw => MessagePacket.parse(messagePacketRaw) || messagePacketRaw);

            demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, createDemoPacketData(messagePackets, stringTables));
        } else {
            demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, decoded);
        }

        demoPacket.ordinal = demoPacketRaw.ordinal;

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
