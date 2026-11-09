/** @import MessagePacketRaw from '../data/MessagePacketRaw.js' */

import Assert from '../core/Assert.js';
import BitWriter from '../core/BitWriter.js';

const MAXIMUM_HEADER_SIZE_BYTES = 10;

/**
 * Packs messages into the data of a demo packet.
 * The counterpart of {@link MessagePacketRawExtractor}.
 */
class MessagePacketRawWriter {
    /** @private @type {Array<MessagePacketRaw>} */
    _messages;

    /**
     * @public
     * @constructor
     * @param {Array<MessagePacketRaw>} messages
     */
    constructor(messages) {
        Assert.isTrue(Array.isArray(messages), 'Invalid messages: expected an array');

        this._messages = messages;
    }

    /**
     * @public
     * @returns {Uint8Array}
     */
    all() {
        const writer = new BitWriter(this._getCapacity());

        for (let i = 0; i < this._messages.length; i++) {
            const message = this._messages[i];

            writer.writeUVarInt(message.type);
            writer.writeUVarInt32(message.payload.length);
            writer.writeBytes(message.payload);
        }

        return writer.getBytes();
    }

    /**
     * @private
     * @returns {number}
     */
    _getCapacity() {
        let capacity = this._messages.length * MAXIMUM_HEADER_SIZE_BYTES;

        for (let i = 0; i < this._messages.length; i++) {
            capacity += this._messages[i].payload.length;
        }

        return capacity;
    }
}

export default MessagePacketRawWriter;
