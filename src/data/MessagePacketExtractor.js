const BitBuffer = require('./buffer/BitBufferFast');

const MessagePacketRaw = require('./MessagePacketRaw');

const BITS_PER_BYTE = 8;

class MessagePacketExtractor {
    /**
     * @constructor
     * @public
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this._bitBuffer = new BitBuffer(buffer);
    }

    *retrieve() {
        this._bitBuffer.reset();

        while (this._bitBuffer.getUnreadCount() >= BITS_PER_BYTE) {
            const type = this._readMessageType();

            const size = this._readMessageSize();

            if (size === null) {
                break;
            }

            const payload = this._readPayload(size.value * BITS_PER_BYTE);

            yield new MessagePacketRaw(type, size, payload);
        }
    }

    /**
     * @private
     *
     * @returns {Number}
     */
    _readMessageType() {
        return this._bitBuffer.readUVarInt();
    }

    /**
     * @private
     *
     * @returns {UVarInt32|null}
     */
    _readMessageSize() {
        return this._bitBuffer.readUVarInt32();
    }

    /**
     * @private
     * @param {Number} bits
     * @returns {Buffer}
     */
    _readPayload(bits) {
        return this._bitBuffer.read(bits);
    }
}

module.exports = MessagePacketExtractor;
