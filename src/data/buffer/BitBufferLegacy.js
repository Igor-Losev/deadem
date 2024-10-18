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

        this._pointers = {
            byte: 0,
            bit: 0
        };
    }

    /**
     * @public
     *
     * @returns {Number}
     */
    getUnreadCount() {
        return this._buffer.length * BITS_PER_BYTE - (this._pointers.byte * BITS_PER_BYTE + this._pointers.bit);
    }

    /**
     * @public
     * @param {Number} numberOfBits
     *
     * @returns {Buffer}
     */
    read(numberOfBits) {
        const unread = this.getUnreadCount();

        if (numberOfBits > unread) {
            throw new Error(`Unable to read [ ${numberOfBits} ] bits - only [ ${unread} ] bits left`);
        }

        const numberOfBytes = Math.ceil(numberOfBits / BITS_PER_BYTE);
        const buffer = Buffer.alloc(numberOfBytes);

        let bufferOffset = 0;
        let result = 0;

        for (let i = 0; i < numberOfBits; i++) {
            const isOverflow = i !== 0 && i % BITS_PER_BYTE === 0;

            if (isOverflow) {
                buffer.writeUInt8(result, bufferOffset);

                bufferOffset += 1;
                result = 0;
            }

            const byte = this._buffer[this._pointers.byte];

            result |= ((byte >> this._pointers.bit) & 1) << (i % BITS_PER_BYTE);

            this._pointers.bit += 1;

            if (this._pointers.bit === BITS_PER_BYTE) {
                this._pointers.byte += 1;
                this._pointers.bit = 0;
            }

            const isLast = i === numberOfBits - 1;

            if (isLast) {
                buffer.writeUInt8(result, bufferOffset);

                bufferOffset += 1;
                result = 0;
            }
        }

        return buffer;
    }

    /**
     * @public
     */
    reset() {
        this._pointers.byte = 0;
        this._pointers.bit = 0;
    }
}

module.exports = BitBuffer;
