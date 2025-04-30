class MessagePacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {Number} type
     * @param {Number} size
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

module.exports = MessagePacketRaw;
