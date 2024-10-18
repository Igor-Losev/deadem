const BitBuffer = require('./buffer/BitBuffer');

const MessagePacket = require('./MessagePacket'),
    VarInt32 = require('./VarInt32');

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

            const payload = this._readPayload(size.value * BITS_PER_BYTE);

            const messagePacket = new MessagePacket(type, size, payload);

            yield messagePacket;
        }
    }

    /**
     * @private
     *
     * @returns {Number}
     */
    _readMessageType() {
        let candidate = this._bitBuffer.read(6).readUInt8();

        switch (candidate & 48) {
            case 16: {
                const value = this._bitBuffer.read(4).readUInt8();

                candidate = (candidate & 15) | (value << 4);

                break;
            }
            case 32: {
                const value = this._bitBuffer.read(8).readUInt8();

                candidate = (candidate & 15) | (value << 4);

                break;
            }
            case 48: {
                const value = this._bitBuffer.read(28).readUInt32LE();

                candidate = (candidate & 15) | (value << 4);

                break;
            }
            default:
                break;
        }

        return candidate;
    }

    /**
     * @private
     *
     * @returns {VarInt32|null}
     */
    _readMessageSize() {
        let buffer = Buffer.alloc(0);
        let parsed = null;

        for (let i = 0; i < VarInt32.MAXIMUM_SIZE_BYTES && parsed === null; i++) {
            const byte = this._bitBuffer.read(BITS_PER_BYTE);

            buffer = Buffer.concat([ buffer, byte ]);

            parsed = VarInt32.parse(buffer);
        }

        return parsed;
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
