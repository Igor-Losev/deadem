/** @import MessagePacketRawWriter from '../writers/MessagePacketRawWriter.js' */

import BitReader from '../core/BitReader.js';

import MessagePacketRaw from '../data/MessagePacketRaw.js';

/**
 * Extracts {@link MessagePacketRaw} from the data of a demo packet.
 *
 * The counterpart of {@link MessagePacketRawWriter}.
 */
class MessagePacketRawExtractor {
    /**
     * @constructor
     * @public
     * @param {Uint8Array} buffer
     */
    constructor(buffer) {
        /** @private */
        this._bitReader = new BitReader(buffer);
    }

    /**
     * Extracts and returns all message packets (raw) from the buffer.
     *
     * @public
     * @returns {Array<MessagePacketRaw>}
     */
    all() {
        const extracted = [ ];

        const bytes = Math.ceil(this._bitReader.getUnreadCount() / BitReader.BITS_PER_BYTE);
        const buffer = new Uint8Array(bytes);

        let bytesRead = 0;

        while (this._bitReader.getUnreadCount() >= BitReader.BITS_PER_BYTE) {
            const type = this._bitReader.readUVarInt();
            const size = this._bitReader.readUVarInt32();

            const payload = this._bitReader.readInBuffer(size * BitReader.BITS_PER_BYTE, buffer.subarray(bytesRead, bytesRead + size));

            bytesRead += size;

            extracted.push(new MessagePacketRaw(type, size, payload));
        }

        return extracted;
    }

    /**
     * @public
     */
    reset() {
        this._bitReader.reset();
    }
}

export default MessagePacketRawExtractor;
