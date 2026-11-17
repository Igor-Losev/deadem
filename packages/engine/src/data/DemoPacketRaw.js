/** @import DemoSource from './enums/DemoSource.js' */

import DemoFormat from './DemoFormat.js';
import VarInt32 from './VarInt32.js';

class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {VarInt32} type
     * @param {DemoSource} source
     * @param {VarInt32} tick
     * @param {VarInt32} frame
     * @param {Uint8Array} payload
     */
    constructor(sequence, type, source, tick, frame, payload) {
        /** @private */
        this._sequence = sequence;
        /** @private */
        this._ordinal = sequence;
        /** @private */
        this._type = type;
        /** @private */
        this._source = source;
        /** @private */
        this._tick = tick;
        /** @private */
        this._frame = frame;
        /** @private */
        this._payload = payload;
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
     * @returns {VarInt32}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {DemoSource}
     */
    get source() {
        return this._source;
    }

    /**
     * @public
     * @returns {VarInt32}
     */
    get tick() {
        return this._tick;
    }

    /**
     * @public
     * @returns {VarInt32}
     */
    get frame() {
        return this._frame;
    }

    /**
     * @public
     * @returns {Uint8Array}
     */
    get payload() {
        return this._payload;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsCompressed() {
        return (this._type.value & DemoFormat.COMPRESSED_FLAG) === DemoFormat.COMPRESSED_FLAG;
    }

    /**
     * Determines whether this is an initial packet (tick === -1).
     *
     * @public
     * @returns {boolean}
     */
    getIsInitial() {
        return this._tick.value === DemoFormat.INITIAL_TICK;
    }

    /**
     * Size in a replay file.
     *
     * @public
     * @returns {number}
     */
    getSize() {
        return VarInt32.getSize(this._type.value) + VarInt32.getSize(this._tick.value) + VarInt32.getSize(this._payload.length) + this._payload.length;
    }

    /**
     * @public
     * @returns {number}
     */
    getTypeId() {
        return this._type.value & ~DemoFormat.COMPRESSED_FLAG;
    }

    /**
     * Returns a packet copy with another uncompressed payload.
     *
     * @public
     * @param {Uint8Array} payload
     * @returns {DemoPacketRaw}
     */
    withPayload(payload) {
        const typeId = this.getTypeId();

        return new DemoPacketRaw(this._sequence, new VarInt32(typeId, VarInt32.getSize(typeId)), this._source, this._tick, new VarInt32(payload.length, VarInt32.getSize(payload.length)), payload);
    }

    /**
     * Returns a packet copy on another tick.
     *
     * @public
     * @param {number} tick
     * @returns {DemoPacketRaw}
     */
    withTick(tick) {
        return new DemoPacketRaw(this._sequence, this._type, this._source, new VarInt32(tick, VarInt32.getSize(tick)), this._frame, this._payload);
    }
}

export default DemoPacketRaw;
