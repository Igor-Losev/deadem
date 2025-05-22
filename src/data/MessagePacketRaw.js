'use strict';

class MessagePacketRaw {
    /**
     * @public
     * @constructor
     * @param {number} type
     * @param {number} size
     * @param {Buffer} payload
     */
    constructor(type, size, payload) {
        this._type = type;
        this._size = size;
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
     * @returns {Buffer}
     */
    get payload() {
        return this._payload;
    }
}

module.exports = MessagePacketRaw;
