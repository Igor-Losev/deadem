'use strict';

const BitBuffer = require('./BitBuffer');

const MASK_DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right'
};

const MASK = {
    [MASK_DIRECTION.LEFT]: [ 255, 127, 63, 31, 15, 7, 3, 1 ],
    [MASK_DIRECTION.RIGHT]: [ 255, 254, 252, 248, 240, 224, 192, 128 ]
};

class BitBufferFast extends BitBuffer {
    /**
     * @constructor
     * @public
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

        const numberOfBytes = Math.ceil((this._pointers.bit + numberOfBits) / BitBuffer.BITS_PER_BYTE);

        let buffer = Buffer.allocUnsafe(numberOfBytes);

        for (let i = 0; i < numberOfBytes; i++) {
            buffer[i] = this._buffer[this._pointers.byte + i];
        }

        const zeroBitsOffset = this._pointers.bit;
        const zeroBitsIgnored = numberOfBytes * BitBuffer.BITS_PER_BYTE - (this._pointers.bit + numberOfBits);

        buffer[0] = buffer[0] & MASK[MASK_DIRECTION.RIGHT][zeroBitsOffset];
        buffer[buffer.length - 1] = buffer[buffer.length - 1] & MASK[MASK_DIRECTION.LEFT][zeroBitsIgnored];

        if (zeroBitsOffset > 0) {
            buffer[0] = buffer[0] >>> zeroBitsOffset;

            for (let i = 0; i < numberOfBytes - 1; i++) {
                buffer[i] |= (buffer[i + 1] & MASK[MASK_DIRECTION.LEFT][BitBuffer.BITS_PER_BYTE - zeroBitsOffset]) << (BitBuffer.BITS_PER_BYTE - zeroBitsOffset);

                buffer[i + 1] = buffer[i + 1] >>> zeroBitsOffset;
            }
        }

        if (numberOfBytes > Math.ceil(numberOfBits / BitBuffer.BITS_PER_BYTE)) {
            buffer = buffer.subarray(0, buffer.length - 1);
        }

        this._pointers.byte += Math.floor((this._pointers.bit + numberOfBits) / BitBuffer.BITS_PER_BYTE);
        this._pointers.bit = (this._pointers.bit + numberOfBits) % BitBuffer.BITS_PER_BYTE;

        return buffer;
    }
}

module.exports = BitBufferFast;
