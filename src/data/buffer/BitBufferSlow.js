'use strict';

const BitBuffer = require('./BitBuffer');

class BitBufferSlow extends BitBuffer {
    /**
     * @public
     * @constructor
     *
     * @param {Buffer|Uint8Array} buffer
     */
    constructor(buffer) {
        super(buffer);
    }

    /**
     * @protected
     * @param {Number} numberOfBits
     *
     * @returns {Buffer}
     */
    _read(numberOfBits) {
        const unread = this.getUnreadCount();

        if (numberOfBits > unread) {
            throw new Error(`Unable to read [ ${numberOfBits} ] bits - only [ ${unread} ] bits left`);
        }

        const numberOfBytes = Math.ceil(numberOfBits / BitBuffer.BITS_PER_BYTE);
        const buffer = Buffer.allocUnsafe(numberOfBytes);

        let bufferOffset = 0;
        let result = 0;

        for (let i = 0; i < numberOfBits; i++) {
            const isOverflow = i !== 0 && i % BitBuffer.BITS_PER_BYTE === 0;

            if (isOverflow) {
                buffer.writeUInt8(result, bufferOffset);

                bufferOffset += 1;
                result = 0;
            }

            const byte = this._buffer[this._pointers.byte];

            result |= ((byte >> this._pointers.bit) & 1) << (i % BitBuffer.BITS_PER_BYTE);

            this._pointers.bit += 1;

            if (this._pointers.bit === BitBuffer.BITS_PER_BYTE) {
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
}

module.exports = BitBufferSlow;
