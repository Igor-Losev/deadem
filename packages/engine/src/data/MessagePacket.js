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
     * @public
     * @returns {MessagePacketObject}
     */
    toObject() {
        return {
            type: this._type.code,
            data: this._data
        };
    }

    /**
     * @public
     * @static
     * @param {MessagePacketObject} raw
     * @param {SchemaRegistry} registry
     * @returns {MessagePacket}
     */
    static fromObject(raw, registry) {
        const type = registry.resolveMessageTypeByCode(raw.type);

        if (type === null) {
            throw new Error(`Unknown MessagePacketType [ ${raw.type} ]`);
        }

        return new MessagePacket(type, raw.data);
    }
}

/**
 * @typedef {{type: String, data: *}} MessagePacketObject
 */

export default MessagePacket;
