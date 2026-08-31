import BitBuffer from '#core/BitBuffer.js';

import MessagePacketRaw from '#data/MessagePacketRaw.js';

class MessagePacketRawExtractor {
    /**
     * @constructor
     * @public
     * @param {Uint8Array} buffer
     */
    constructor(buffer) {
        this._bitBuffer = new BitBuffer(buffer);
    }

    /**
     * Extracts and returns all message packets (raw) from the buffer.
     *
     * @public
     * @returns {Array<MessagePacketRaw>}
     */
    all() {
        const extracted = [ ];

        const bytes = Math.ceil(this._bitBuffer.getUnreadCount() / BitBuffer.BITS_PER_BYTE);
        const buffer = new Uint8Array(bytes);

        let bytesRead = 0;

        while (this._bitBuffer.getUnreadCount() >= BitBuffer.BITS_PER_BYTE) {
            const type = this._bitBuffer.readUVarInt();
            const size = this._bitBuffer.readUVarInt32();

            const payload = this._bitBuffer.readInBuffer(size * BitBuffer.BITS_PER_BYTE, buffer.subarray(bytesRead, bytesRead + size));

            bytesRead += size;

            extracted.push(new MessagePacketRaw(type, size, payload));
        }

        return extracted;
    }

    /**
     * @public
     */
    reset() {
        this._bitBuffer.reset();
    }
}

export default MessagePacketRawExtractor;
