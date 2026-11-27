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
     * Extracts the message packets (raw) the filter keeps.
     *
     * @public
     * @param {((typeId: number) => boolean)|null} [filter=null]
     * @returns {Array<MessagePacketRaw>}
     */
    all(filter = null) {
        const extracted = [ ];

        const bytes = Math.ceil(this._bitReader.getUnreadCount() / BitReader.BITS_PER_BYTE);
        const buffer = new Uint8Array(bytes);

        let bytesRead = 0;

        while (this._bitReader.getUnreadCount() >= BitReader.BITS_PER_BYTE) {
            const type = this._bitReader.readUVarInt();
            const size = this._bitReader.readUVarInt32();

            if (filter !== null && !filter(type)) {
                this._bitReader.move(size * BitReader.BITS_PER_BYTE);

                continue;
            }

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
