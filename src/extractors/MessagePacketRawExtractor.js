'use strict';

const BitBuffer = require('../data/buffer/BitBufferFast');

const MessagePacketRaw = require('../data/MessagePacketRaw');

class MessagePacketRawExtractor {
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

        while (this._bitBuffer.getUnreadCount() >= BitBuffer.BITS_PER_BYTE) {
            const type = this._bitBuffer.readUVarInt();

            const size = this._bitBuffer.readUVarInt32();

            if (size === null) {
                break;
            }

            const payload = this._bitBuffer.read(size.value * BitBuffer.BITS_PER_BYTE);

            yield new MessagePacketRaw(type, size, payload);
        }
    }
}

module.exports = MessagePacketRawExtractor;
