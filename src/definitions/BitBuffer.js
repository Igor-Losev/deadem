const VarInt32 = require('./VarInt32');

const BITS_PER_BYTE = 8;

class BitBuffer {
    /**
     * @public
     * @constructor
     *
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this._buffer = buffer;

        // console.log(this._buffer);

        this._pointers = {
            byte: 0,
            bit: 0
        };
    }

    readBits(n) {
        let result = 0;

        for (let i = 0; i < n; i++) {
            if (BITS_PER_BYTE === this._pointers.bit) {
                this._pointers.byte += 1;
                this._pointers.bit = 0;
            }

            const byte = this._buffer[this._pointers.byte];

            result |= ((byte >> this._pointers.bit) & 1) << i;

            this._pointers.bit += 1;
        }

        return result;
    }

    readMessageType() {
        let candidate = this.readBits(6);

        switch (candidate & 48) {
            case 16:
                candidate = (candidate & 15) | (this.readBits(4) << 4);

                break;
            case 32:
                candidate = (candidate & 15) | (this.readBits(8) << 4);

                break;
            case 48:
                candidate = (candidate & 15) | (this.readBits(28) << 4);

                break;
            default:
                break;
        }

        return candidate;
    }

    readMessageSize() {
        let parsed = null;

        let buffer = new Buffer(0);

        for (let i = 0; i < VarInt32.MAXIMUM_SIZE_BYTES && parsed === null; i++) {
            const byte = this.readBits(BITS_PER_BYTE);

            // console.log(`[ i: ${i} ] byte:`, byte);

            const suffix = new Buffer(1);

            suffix.writeUInt8(byte);

            const newBuffer = Buffer.concat([ buffer, suffix ]);

            buffer = newBuffer;

            // console.log(buffer);

            parsed = VarInt32.parse(buffer);
        }

        // console.log(parsed);

        return parsed;
    }

    readMessagePayload(size) {
        let buffer = new Buffer(size);

        for (let i = 0; i < size; i++) {
            const byte = this.readBits(BITS_PER_BYTE);

            buffer.writeUInt8(byte, i);
        }

        return buffer;
    }
}

module.exports = BitBuffer;
