class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {VarInt32} type
     * @param {VarInt32} tick
     * @param {VarInt32} frame
     * @param {Buffer} payload
     */
    constructor(sequence, type, tick, frame, payload) {
        this._sequence = sequence;
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
     * @returns {Buffer}
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
