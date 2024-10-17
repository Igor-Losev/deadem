class MessagePacket {
    /**
     * @public
     * @constructor
     *
     * @param {Number} type
     * @param {VarInt32} size
     * @param {Buffer} payload
     */
    constructor(type, size, payload) {
        this._type = type;
        this._size = size;
        this._payload = payload;
    }

    get type() {
        return this._type;
    }

    get size() {
        return this._size;
    }

    get payload() {
        return this._payload;
    }
}

module.exports = MessagePacket;
