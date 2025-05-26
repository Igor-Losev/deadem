import BitBuffer from '#core/BitBuffer.js';

import MessagePacketRaw from '../data/MessagePacketRaw.js';

class MessagePacketRawExtractor {
    /**
     * @constructor
     * @public
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this._bitBuffer = new BitBuffer(buffer);
    }

    /**
     * @public
     * @returns {Array<MessagePacketRaw>}
     */
    all() {
        const extracted = [ ];

        while (this._bitBuffer.getUnreadCount() >= BitBuffer.BITS_PER_BYTE) {
            extracted.push(this._extractOnce());
        }

        return extracted;
    }

    /**
     * @generator
     * @yields {MessagePacketRaw}
     * @returns {void}
     */
    *retrieve() {
        while (this._bitBuffer.getUnreadCount() >= BitBuffer.BITS_PER_BYTE) {
            yield this._extractOnce();
        }
    }

    /**
     * @public
     */
    reset() {
        this._bitBuffer.reset();
    }

    /**
     * @protected
     * @returns {MessagePacketRaw}
     */
    _extractOnce() {
        const type = this._bitBuffer.readUVarInt();
        const size = this._bitBuffer.readUVarInt32();
        const payload = this._bitBuffer.read(size * BitBuffer.BITS_PER_BYTE, true);

        return new MessagePacketRaw(type, size, payload);
    }
}

export default MessagePacketRawExtractor;
