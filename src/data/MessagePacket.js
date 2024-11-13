'use strict';

class MessagePacket {
    /**
     * @public
     * @constructor
     *
     * @param {MessagePacketType} type
     * @param {*} data
     */
    constructor(type, data) {
        this._type = type;
        this._data = data;
    }

    /**
     * @returns {MessagePacketType}
     */
    get type() {
        return this._type;
    }

    get data() {
        return this._data;
    }
}

module.exports = MessagePacket;
