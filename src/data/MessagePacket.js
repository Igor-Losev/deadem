import MessagePacketType from './enums/MessagePacketType.js';

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

    /**
     * @returns {*}
     */
    get data() {
        return this._data;
    }

    /**
     * @static
     * @public
     * @param {MessagePacketObject} object
     * @returns {MessagePacket}
     */
    static fromObject(object) {
        return new MessagePacket(MessagePacketType.parse(object.type), object.data);
    }

    /**
     * @public
     * @returns {MessagePacketObject}
     */
    toObject() {
        return {
            type: this._type.code,
            data: this._data
        };
    }
}

/**
 * @typedef {{type: String, data: *}} MessagePacketObject
 */

export default MessagePacket;
