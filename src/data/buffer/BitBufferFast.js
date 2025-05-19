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

const REUSABLE_BUFFER_SIZE = 4;

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
     * @param {boolean} allocateNew
     * @returns {Buffer}
     */
    _read(numberOfBits, allocateNew = false) {
        const unread = this.getUnreadCount();

        if (numberOfBits > unread) {
            throw new Error(`Unable to read [ ${numberOfBits} ] bit(s) - only [ ${unread} ] bit(s) left`);
        }

        const numberOfRequestedBytes = Math.ceil(numberOfBits / BitBuffer.BITS_PER_BYTE);
        const numberOfAffectedBytes = Math.ceil((this._pointers.bit + numberOfBits) / BitBuffer.BITS_PER_BYTE);

        let extraByte;

        if (numberOfAffectedBytes > numberOfRequestedBytes) {
            extraByte = this._buffer[this._pointers.byte + numberOfAffectedBytes - 1];
        } else {
            extraByte = 0;
        }

        let buffer;

        if (!allocateNew && numberOfRequestedBytes <= REUSABLE_BUFFER_SIZE) {
            buffer = pool[numberOfRequestedBytes - 1];
        } else {
            buffer = Buffer.allocUnsafe(numberOfRequestedBytes);
        }

        for (let i = 0; i < numberOfRequestedBytes; i++) {
            buffer[i] = this._buffer[this._pointers.byte + i];
        }

        const zeroBitsOffset = this._pointers.bit;
        const zeroBitsIgnored = numberOfAffectedBytes * BitBuffer.BITS_PER_BYTE - (this._pointers.bit + numberOfBits);

        buffer[0] &= MASK[MASK_DIRECTION.RIGHT][zeroBitsOffset];

        if (numberOfAffectedBytes > numberOfRequestedBytes) {
            extraByte &= MASK[MASK_DIRECTION.LEFT][zeroBitsIgnored];
        } else {
            buffer[buffer.length - 1] &= MASK[MASK_DIRECTION.LEFT][zeroBitsIgnored];
        }

        if (zeroBitsOffset > 0) {
            buffer[0] = buffer[0] >>> zeroBitsOffset;

            for (let i = 0; i < numberOfRequestedBytes; i++) {
                let next;

                if (i < numberOfRequestedBytes - 1) {
                    next = buffer[i + 1];
                } else {
                    next = extraByte;
                }

                buffer[i] |= (next & MASK[MASK_DIRECTION.LEFT][BitBuffer.BITS_PER_BYTE - zeroBitsOffset]) << (BitBuffer.BITS_PER_BYTE - zeroBitsOffset);

                if (i < numberOfRequestedBytes) {
                    buffer[i + 1] = buffer[i + 1] >>> zeroBitsOffset;
                }
            }
        }

        this._pointers.byte += Math.floor((this._pointers.bit + numberOfBits) / BitBuffer.BITS_PER_BYTE);
        this._pointers.bit = (this._pointers.bit + numberOfBits) % BitBuffer.BITS_PER_BYTE;

        return buffer;
    }
}

const reusable = Buffer.allocUnsafe(REUSABLE_BUFFER_SIZE);

const pool = [ ];

for (let i = 0; i < REUSABLE_BUFFER_SIZE; i++) {
    pool.push(reusable.subarray(0, i + 1));
}

module.exports = BitBufferFast;
