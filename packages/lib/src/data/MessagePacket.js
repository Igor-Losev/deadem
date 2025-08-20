import MessagePacketType from '#data/enums/MessagePacketType.js';

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
     * @static
     * @public
     * @param {MessagePacketRaw} messagePacketRaw
     * @returns {MessagePacket|null}
     */
    static parse(messagePacketRaw) {
        const messagePacketType = MessagePacketType.parseById(messagePacketRaw.type) || null;

        if (messagePacketType === null) {
            return null;
        }

        let data;

        try {
            data = messagePacketType.proto.decode(messagePacketRaw.payload);
        } catch {
            return null;
        }

        return new MessagePacket(messagePacketType, data);
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
