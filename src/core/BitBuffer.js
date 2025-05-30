import VarInt32 from '#data/VarInt32.js';

/**
 * A class for reading data at the bit level from {@link Buffer} or {@link Uint8Array}.
 */
class BitBuffer {
    /**
     * @constructor
     * @param {Buffer|Uint8Array} buffer
     */
    constructor(buffer) {
        this._buffer = buffer;

        this._pointers = {
            byte: 0,
            bit: 0
        };
    }

    /**
     * @static
     * @returns {number}
     */
    static get BITS_PER_BYTE() {
        return BITS_PER_BYTE;
    }

    /**
     * Reads an unsigned 32-bit integer from the given buffer, supporting buffers of length 1 to 4 bytes.
     *
     * @public
     * @static
     * @param {Buffer} buffer - The buffer to read from. Must be between 1 and 4 bytes long.
     * @returns {number} - The unsigned integer read from the buffer.
     * @throws {Error} If the buffer size is not between 1 and 4 bytes.
     */
    static readUInt32LE(buffer) {
        switch (buffer.byteLength) {
            case 1:
                return buffer[0] >>> 0;
            case 2:
                return (buffer[0] | (buffer[1] << 8)) >>> 0;
            case 3:
                return (buffer[0] | (buffer[1] << 8) | (buffer[2] << 16)) >>> 0;
            case 4:
                return (buffer[0] | (buffer[1] << 8) | (buffer[2] << 16) | (buffer[3] << 24)) >>> 0;
            default:
                throw new Error(`Unexpected buffer size [ ${buffer.byteLength} ]`);
        }
    }

    /**
     * Returns the number of read bits.
     *
     * @public
     * @returns {number}
     */
    getReadCount() {
        return this._pointers.byte * BITS_PER_BYTE + this._pointers.bit;
    }

    /**
     * Returns the number of remaining bits available to read in the buffer.
     *
     * @public
     * @returns {number}
     */
    getUnreadCount() {
        return this._buffer.length * BITS_PER_BYTE - (this._pointers.byte * BITS_PER_BYTE + this._pointers.bit);
    }

    /**
     * Moves the internal read pointer forward or backward by a given number of bits.
     *
     * @public
     * @param {number} bits - Number of bits to move.
     */
    move(bits) {
        const abs = Math.abs(bits);

        if (abs === 0) {
            return;
        }

        if (bits > 0 && bits > this.getUnreadCount()) {
            throw new Error(`Cannot move pointer forward by ${bits} bits: only [ ${this.getUnreadCount()} ] bits unread`);
        }

        if (bits < 0 && abs > this.getReadCount()) {
            throw new Error(`Cannot move pointer backward by ${abs} bits: only [ ${this.getReadCount()} ] bits read`);
        }

        const numberOfBytes = Math.floor(abs / BITS_PER_BYTE);
        const numberOfBits = abs % BITS_PER_BYTE;

        if (bits > 0) {
            this._pointers.byte += numberOfBytes;

            if (this._pointers.bit + numberOfBits < BITS_PER_BYTE) {
                this._pointers.bit += numberOfBits;
            } else {
                this._pointers.byte += 1;
                this._pointers.bit = (this._pointers.bit + numberOfBits) % BITS_PER_BYTE;
            }
        }

        if (bits < 0) {
            this._pointers.byte -= numberOfBytes;

            if (this._pointers.bit - numberOfBits >= 0) {
                this._pointers.bit -= numberOfBits;
            } else {
                this._pointers.byte -= 1;
                this._pointers.bit = BITS_PER_BYTE - Math.abs(this._pointers.bit - numberOfBits);
            }
        }
    }

    /**
     * @see {@link BitBuffer#_read}
     *
     * @public
     * @param {number} numberOfBits
     * @param {boolean} allocateNew
     * @returns {Buffer}
     */
    read(numberOfBits, allocateNew = false) {
        return this._read(numberOfBits, allocateNew);
    }

    /**
     * Reads an angle encoded in `n` bits from the buffer.
     *
     * @param {number} n - The number of bits.
     * @returns {number} - The angle.
     */
    readAngle(n) {
        const buffer = this._read(n);

        const value = BitBuffer.readUInt32LE(buffer);

        return (value * 360) / (1 << n);
    }

    /**
     * Reads a single bit from the buffer.
     *
     * @public
     * @returns {boolean}
     */
    readBit() {
        const value = ((this._buffer[this._pointers.byte] >> this._pointers.bit) & 1) === 1;

        this.move(1);

        return value;
    }

    /**
     * Reads a coordinate.
     *
     * @public
     * @returns {number}
     */
    readCoordinate() {
        let value = 0;

        const hasInteger = this.readBit();
        const hasFractional = this.readBit();

        if (hasInteger || hasFractional) {
            const sign = this.readBit();

            let integer = 0;

            if (hasInteger) {
                const buffer = this._read(14);

                integer = buffer.readUInt16LE() + 1;
            }

            let fractional = 0;

            if (hasFractional) {
                const buffer = this._read(5);

                fractional = buffer.readUInt8();
            }

            value = integer + fractional * (1 / (1 << 5));

            if (sign) {
                value = -value;
            }
        }

        return value;
    }

    /**
     * Reads a precise coordinate encoded in 20 bits.
     *
     * @public
     * @returns {number}
     */
    readCoordinatePrecise() {
        const value = BitBuffer.readUInt32LE(this._read(20));

        return value * (360 / (1 << 20)) - 180;
    }

    /**
     * Reads 32 bits from the buffer and converts them to a float using little-endian format.
     *
     * @public
     * @returns {number} The float value interpreted from the 32-bit buffer.
     */
    readFloat() {
        const buffer = this._read(32);

        return buffer.readFloatLE();
    }

    /**
     * Reads a normal value (normalized float in the range [-1.0, 1.0]) from the buffer.
     * The value is encoded using 12 bits, where the first bit indicates the sign
     * and the remaining 11 bits represent the magnitude.
     *
     * @public
     * @returns {number} The normalized value in the range [-1.0, 1.0].
     */
    readNormal() {
        const sign = this.readBit();
        const length = this._read(11).readUInt16LE();

        const value = length * (1 / ((1 << 11) - 1));

        if (sign) {
            return -value;
        } else {
            return value;
        }
    }

    /**
     * Reads a normal vector from the buffer.
     *
     * @public
     * @returns {number[]} An array containing the X, Y, and Z components of the normal vector.
     */
    readNormalVector() {
        const vector = [ 0, 0, 0 ];

        const hasX = this.readBit();
        const hasY = this.readBit();

        if (hasX) {
            vector[0] = this.readNormal();
        }

        if (hasY) {
            vector[1] = this.readNormal();
        }

        const negativeZ = this.readBit();
        const sum = Math.pow(vector[0], 2) + Math.pow(vector[1], 2);

        if (sum < 1) {
            vector[2] = Math.sqrt(1 - sum);
        } else {
            vector[2] = 0;
        }

        if (negativeZ) {
            vector[2] = -vector[2];
        }

        return vector;
    }

    /**
     * Reads a null-terminated string from the buffer, byte by byte,
     * until a zero byte is found or the optional length limit is reached.
     *
     * @public
     * @param {number=} length - Maximum number of bytes to read.
     * @returns {string} The decoded string.
     */
    readString(length) {
        const bytes = [ ];

        while (true) {
            if (Number.isInteger(length) && result.length >= length) {
                break;
            }

            const buffer = this._read(BITS_PER_BYTE);

            if (buffer[0] === 0) {
                break;
            }

            bytes.push(buffer[0]);
        }

        return Buffer.from(bytes).toString();
    }

    /**
     * Reads an unsigned 8-bit integer (1 byte) from the buffer.
     *
     * @public
     * @returns {number} The read unsigned integer (0–255).
     */
    readUInt8() {
        const buffer = this._read(BITS_PER_BYTE);

        return buffer[0] >>> 0;
    }

    /**
     * Reads an unsigned variable-length integer encoded in Source 2's custom bit-packed format.
     * The initial 6 bits determine how many additional bits to read.
     *
     * @public
     * @returns {number} The decoded unsigned integer.
     */
    readUVarInt() {
        let result = this._read(6).readUInt8();

        switch (result & 48) {
            case 16: {
                const value = this._read(4).readUInt8();

                result = (result & 15) | (value << 4);

                break;
            }
            case 32: {
                const value = this._read(8).readUInt8();

                result = (result & 15) | (value << 4);

                break;
            }
            case 48: {
                const value = this._read(28).readUInt32LE();

                result = (result & 15) | (value << 4);

                break;
            }
            default: {
                break;
            }
        }

        return result >>> 0;
    }

    /**
     * Reads a signed variable-length integer from the buffer.
     *
     * @public
     * @returns {number} The decoded signed integer.
     */
    readVarInt32() {
        const unsigned = this.readUVarInt32();

        return (unsigned >> 1) ^ -(unsigned & 1);
    }

    /**
     * Reads a signed variable-length 64-bit integer from the buffer.
     *
     * @public
     * @returns {BigInt}
     */
    readVarInt64() {
        const unsigned = this.readUVarInt64();

        return (unsigned >> 1n) ^ -(unsigned & 1n);
    }

    /**
     * Reads an unsigned variable-length integer from the buffer.
     * Each byte contributes 7 bits to the result; the highest bit indicates continuation.
     *
     * @public
     * @returns {number} The decoded unsigned integer.
     */
    readUVarInt32() {
        let bitsAvailable = this.getUnreadCount();
        let value = 0;
        let offset = 0;

        while (bitsAvailable >= BITS_PER_BYTE && offset < VarInt32.MAXIMUM_SIZE_BYTES) {
            const byte = this.readUInt8();

            bitsAvailable -= BITS_PER_BYTE;

            value |= (byte & 127) << (7 * offset);

            offset += 1;

            if ((byte & 128) !== 128) {
                break;
            }
        }

        return value >>> 0;
    }

    /**
     * Reads an unsigned variable-length 64-bit integer from the buffer.
     * Each byte contributes 7 bits to the result; the highest bit indicates continuation.
     *
     * The maximum amount of bytes read possible here is 10. Here is why:
     *      1) 64-bit integer itself takes 8 bytes;
     *      2) Each byte includes a continuation bit (the highest bit). Therefore,
     *         a 9th byte is required. Since the 9th byte also has a continuation bit,
     *         it adds up to 9 bytes + 1 continuation bit, resulting in a total of 10 bytes
     *         to represent the maximum possible 64-bit integer.
     *
     * @public
     * @returns {BigInt}
     */
    readUVarInt64() {
        let continuation = true;
        let iterations = 0n;
        let value = 0n;

        while (continuation) {
            const byte = BigInt(this.readUInt8());

            if (iterations > 9n || (iterations === 9n && byte > 1n)) {
                throw new Error('Overflow');
            }

            value |= (byte & 127n) << (7n * iterations);

            continuation = (byte & 128n) === 128n;

            iterations++;
        }

        return value;
    }

    /**
     * Reads a variable-length unsigned integer representing a part of the {@link FieldPath}.
     * The number of bits read depends on a series of flags (prefix bits).
     *
     * @public
     * @returns {number}
     */
    readUVarIntFieldPath() {
        let flag;

        flag = this.readBit();

        if (flag) {
            return this._read(2).readUInt8();
        }

        flag = this.readBit();

        if (flag) {
            return this._read(4).readUInt8();
        }

        flag = this.readBit();

        if (flag) {
            return this._read(10).readUInt16LE();
        }

        flag = this.readBit();

        if (flag) {
            return BitBuffer.readUInt32LE(this._read(17));
        }

        return this._read(31).readUInt32LE();
    }

    /**
     * Resets internal byte and bit pointers to the beginning of the buffer.
     *
     * @public
     */
    reset() {
        this._pointers.byte = 0;
        this._pointers.bit = 0;
    }

    /**
     * Reads the specified number of bits from the buffer.
     * Returns a Buffer with a length of Math.ceil(numberOfBits / 8).
     *
     * @protected
     * @param {number} numberOfBits - The number of beats to read.
     * @param {boolean=} allocateNew - Whether to allocate a new memory for returning buffer.
     * If `true`, a new buffer is allocated.
     * If `false` (default), a reusable buffer may be returned, which can be overwritten in subsequent operations.
     * @returns {Buffer} - A buffer containing the read data.
     */
    _read(numberOfBits, allocateNew = false) {
        const unread = this.getUnreadCount();

        if (numberOfBits > unread) {
            throw new Error(`Unable to read [ ${numberOfBits} ] bit(s) - only [ ${unread} ] bit(s) left`);
        }

        const numberOfRequestedBytes = Math.ceil(numberOfBits / BITS_PER_BYTE);
        const numberOfAffectedBytes = Math.ceil((this._pointers.bit + numberOfBits) / BITS_PER_BYTE);

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
        const zeroBitsIgnored = numberOfAffectedBytes * BITS_PER_BYTE - (this._pointers.bit + numberOfBits);

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

                buffer[i] |= (next & MASK[MASK_DIRECTION.LEFT][BITS_PER_BYTE - zeroBitsOffset]) << (BITS_PER_BYTE - zeroBitsOffset);

                if (i < numberOfRequestedBytes) {
                    buffer[i + 1] = buffer[i + 1] >>> zeroBitsOffset;
                }
            }
        }

        this._pointers.byte += Math.floor((this._pointers.bit + numberOfBits) / BITS_PER_BYTE);
        this._pointers.bit = (this._pointers.bit + numberOfBits) % BITS_PER_BYTE;

        return buffer;
    }
}

const BITS_PER_BYTE = 8;

const MASK_DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right'
};

const MASK = {
    [MASK_DIRECTION.LEFT]: [ 255, 127, 63, 31, 15, 7, 3, 1 ],
    [MASK_DIRECTION.RIGHT]: [ 255, 254, 252, 248, 240, 224, 192, 128 ]
};

const REUSABLE_BUFFER_SIZE = 4;

const reusable = Buffer.allocUnsafe(REUSABLE_BUFFER_SIZE);

const pool = [ ];

for (let i = 0; i < REUSABLE_BUFFER_SIZE; i++) {
    pool.push(reusable.subarray(0, i + 1));
}

export default BitBuffer;
