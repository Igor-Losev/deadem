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
     * @param {Buffer|Uint8Array} payload
     */
    constructor(sequence, type, source, tick, frame, payload) {
        this._sequence = sequence;
        this._ordinal = sequence;
        this._type = type;
        this._source = source;
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
     * @returns {Buffer|Uint8Array}
     */
    get payload() {
        return this._payload;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsCompressed() {
        return (this._type.value & 64) === 64;
    }

    /**
     * Determines whether this is an initial packet (tick === -1).
     *
     * @public
     * @returns {boolean}
     */
    getIsInitial() {
        return this._tick.value === -1;
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
        return this._type.value & ~64;
    }
}

export default DemoPacketRaw;
