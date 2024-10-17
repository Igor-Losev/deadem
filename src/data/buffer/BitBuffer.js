const BITS_PER_BYTE = 8;

const MASK_DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right'
};

const MASK = {
    [MASK_DIRECTION.LEFT]: [ 255, 127, 63, 31, 15, 7, 3, 1 ],
    [MASK_DIRECTION.RIGHT]: [ 255, 254, 252, 248, 240, 224, 192, 128 ]
};

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

        const numberOfBytes = Math.ceil((this._pointers.bit + numberOfBits) / BITS_PER_BYTE);

        let buffer = Buffer.alloc(numberOfBytes);

        for (let i = 0; i < numberOfBytes; i++) {
            buffer[i] = this._buffer[this._pointers.byte + i];
        }

        const zeroBitsOffset = this._pointers.bit;
        const zeroBitsIgnored = numberOfBytes * BITS_PER_BYTE - (this._pointers.bit + numberOfBits);

        buffer[0] = buffer[0] & MASK[MASK_DIRECTION.RIGHT][zeroBitsOffset];
        buffer[buffer.length - 1] = buffer[buffer.length - 1] & MASK[MASK_DIRECTION.LEFT][zeroBitsIgnored];

        if (zeroBitsOffset > 0) {
            buffer[0] = buffer[0] >>> zeroBitsOffset;

            for (let i = 0; i < numberOfBytes - 1; i++) {
                buffer[i] |= (buffer[i + 1] & MASK[MASK_DIRECTION.LEFT][BITS_PER_BYTE - zeroBitsOffset]) << (BITS_PER_BYTE - zeroBitsOffset);

                buffer[i + 1] = buffer[i + 1] >>> zeroBitsOffset;
            }
        }

        if (numberOfBytes > Math.ceil(numberOfBits / BITS_PER_BYTE)) {
            buffer = buffer.subarray(0, buffer.length - 1);
        }

        for (let i = 0; i < Math.floor(buffer.length / 2); i++) {
            const swap = buffer[i];

            buffer[i] = buffer[buffer.length - 1 - i];
            buffer[buffer.length - 1 - i] = swap;
        }

        this._pointers.byte += Math.floor((this._pointers.bit + numberOfBits) / BITS_PER_BYTE);
        this._pointers.bit = (this._pointers.bit + numberOfBits) % BITS_PER_BYTE;

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
