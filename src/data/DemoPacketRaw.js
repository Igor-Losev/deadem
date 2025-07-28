import VarInt32 from '#data/VarInt32.js';

class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {number} partition
     * @param {VarInt32} type
     * @param {VarInt32} tick
     * @param {VarInt32} frame
     * @param {Buffer|Uint8Array} payload
     */
    constructor(sequence, partition, type, tick, frame, payload) {
        this._sequence = sequence;
        this._partition = partition;
        this._type = type;
        this._tick = tick;
        this._frame = frame;
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
    get partition() {
        return this._partition;
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
     * @returns {Buffer|Uint8Array}
     */
    get payload() {
        return this._payload;
    }

    /**
     * @public
     * @static
     * @param {DemoPacketRawObject} object
     * @returns {DemoPacketRaw}
     */
    static fromObject(object) {
        return new DemoPacketRaw(
            object.sequence,
            object.partition,
            VarInt32.fromObject(object.type),
            VarInt32.fromObject(object.tick),
            VarInt32.fromObject(object.frame),
            object.payload
        );
    }

    /**
     * @static
     * @param {number} value
     * @returns {number}
     */
    static getTypeId(value) {
        return getTypeId(value);
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsCompressed() {
        return (this._type.value & 64) === 64;
    }

    /**
     * @public
     * @returns {number}
     */
    getSize() {
        return this._type.size + this._tick.size + this._frame.size + this._payload.length;
    }

    /**
     * @public
     * @returns {number}
     */
    getTypeId() {
        return getTypeId(this._type.value);
    }

    /**
     * @public
     * @returns {DemoPacketRawObject}
     */
    toObject() {
        return {
            sequence: this._sequence,
            partition: this._partition,
            type: this._type.toObject(),
            tick: this._tick.toObject(),
            frame: this._frame.toObject(),
            payload: this._payload
        };
    }
}

/**
 * @param {number} value
 * @returns {number}
 */
function getTypeId(value) {
    return value & ~64;
}

/**
 * @typedef {Object} DemoPacketRawObject
 * @property {number} sequence
 * @property {number} partition
 * @property {VarInt32Object} type
 * @property {VarInt32Object} tick
 * @property {VarInt32Object} frame
 * @property {Buffer|Uint8Array} payload
 */

export default DemoPacketRaw;
