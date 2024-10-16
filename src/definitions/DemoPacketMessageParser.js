const BitBufferReader = require('./BitBufferReader');

const DemoPacketMessage = require('./DemoPacketMessage');

const VarInt32 = require('./VarInt32');

const BITS_PER_BYTE = 8;

class DemoPacketMessageParser {
    /**
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this._bitBufferReader = new BitBufferReader(buffer);
    }

    /**
     * @public
     *
     * @returns {Array<DemoPacketMessage>}
     */
    parse() {
        this._bitBufferReader.reset();

        const messages = [ ];

        while (this._bitBufferReader.getUnreadCount() > 0) {
            let messageType;

            try {
                messageType = this._readMessageType();
            } catch (error) {
                messageType = null;
            }

            if (messageType === null || this._bitBufferReader.getUnreadCount() === 0) {
                break;
            }

            let messageSize;

            try {
                messageSize = this._readMessageSize();
            } catch (error) {
                messageSize = null;
            }

            if (messageSize === null || this._bitBufferReader.getUnreadCount() === 0) {
                break;
            }

            const payload = this._bitBufferReader.read(BITS_PER_BYTE * messageSize.value);

            const message = new DemoPacketMessage(messageType, messageSize.value, payload);

            messages.push(message);
        }

        return messages;
    }

    /**
     * @private
     *
     * @returns {Number}
     */
    _readMessageType() {
        let candidate = this._bitBufferReader.read(6).readUInt8();

        switch (candidate & 48) {
            case 16: {
                const number = this._bitBufferReader.read(4).readUInt8();

                candidate = (candidate & 15) | (number << 4);

                break;
            }
            case 32: {
                const number = this._bitBufferReader.read(8).readUInt8();

                candidate = (candidate & 15) | (number << 4);

                break;
            }
            case 48: {
                const number = this._bitBufferReader.read(28).readUInt32LE();

                candidate = (candidate & 15) | (number << 4);

                break;
            }
            default:
                break;
        }

        return candidate;
    }

    _readMessageSize() {
        let buffer = Buffer.alloc(0);
        let parsed = null;

        for (let i = 0; i < VarInt32.MAXIMUM_SIZE_BYTES && parsed === null; i++) {
            const byte = this._bitBufferReader.read(BITS_PER_BYTE);

            buffer = Buffer.concat([ buffer, byte ]);

            parsed = VarInt32.parse(buffer);
        }

        return parsed;
    }
}

module.exports = DemoPacketMessageParser;
