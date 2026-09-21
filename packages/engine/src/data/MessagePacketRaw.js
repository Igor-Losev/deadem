class MessagePacketRaw {
    /**
     * @public
     * @constructor
     * @param {number} type
     * @param {number} size
     * @param {Uint8Array} payload
     */
    constructor(type, size, payload) {
        /** @private */
        this._type = type;
        /** @private */
        this._size = size;
        /** @private */
        this._payload = payload;
    }

    /**
     * @public
     * @returns {number}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {number}
     */
    get size() {
        return this._size;
    }

    /**
     * @public
     * @returns {Uint8Array}
     */
    get payload() {
        return this._payload;
    }
}

export default MessagePacketRaw;
