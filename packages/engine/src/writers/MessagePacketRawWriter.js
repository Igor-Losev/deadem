/** @import MessagePacketRaw from '../data/MessagePacketRaw.js' */
/** @import MessagePacketRawExtractor from '../extractors/MessagePacketRawExtractor.js' */

import Assert from '../core/Assert.js';
import BitWriter from '../core/BitWriter.js';

const MAXIMUM_HEADER_SIZE_BYTES = 10;

/**
 * Packs {@link MessagePacketRaw} into the data of a demo packet.
 *
 * The counterpart of {@link MessagePacketRawExtractor}.
 */
class MessagePacketRawWriter {
    /** @private @type {Array<MessagePacketRaw>} */
    _messagePacketsRaw;

    /**
     * @public
     * @constructor
     * @param {Array<MessagePacketRaw>} messagePacketsRaw
     */
    constructor(messagePacketsRaw) {
        Assert.isTrue(Array.isArray(messagePacketsRaw), 'Invalid messagePacketsRaw: expected an array');

        this._messagePacketsRaw = messagePacketsRaw;
    }

    /**
     * @public
     * @returns {Uint8Array}
     */
    all() {
        const writer = new BitWriter(this._getCapacity());

        for (let i = 0; i < this._messagePacketsRaw.length; i++) {
            const messagePacketRaw = this._messagePacketsRaw[i];

            writer.writeUVarInt(messagePacketRaw.type);
            writer.writeUVarInt32(messagePacketRaw.payload.length);

            writer.writeBytes(messagePacketRaw.payload);
        }

        return writer.getBuffer();
    }

    /**
     * @private
     * @returns {number}
     */
    _getCapacity() {
        let capacity = this._messagePacketsRaw.length * MAXIMUM_HEADER_SIZE_BYTES;

        for (let i = 0; i < this._messagePacketsRaw.length; i++) {
            capacity += this._messagePacketsRaw[i].payload.length;
        }

        return capacity;
    }
}

export default MessagePacketRawWriter;
