'use strict';

const UVarInt32 = require('./../UVarInt32');

const BITS_PER_BYTE = 8;

class BitBuffer {
    /**
     * @abstract
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

    static get BITS_PER_BYTE() {
        return BITS_PER_BYTE;
    }

    /**
     * Returns the number of remaining bits available to read in the buffer.
     *
     * @public
     * @returns {Number}
     */
    getUnreadCount() {
        return this._buffer.length * BITS_PER_BYTE - (this._pointers.byte * BITS_PER_BYTE + this._pointers.bit);
    }

    /**
     * Reads the specified number of bits from the buffer.
     * Returns a Buffer with a length of Math.ceil(numberOfBits / 8).
     *
     * @public
     * @param {number} numberOfBits - The number of bits to read.
     * @returns {Buffer} A buffer containing the read bits.
     */
    read(numberOfBits) {
        return this._read(numberOfBits);
    }

    /**
     * Reads a single bit from the buffer.
     * Returns either 0 or 1.
     *
     * @public
     * @returns {number} The bit value (0 or 1).
     */
    readBit() {
        const buffer = this._read(1);

        return buffer[0] >>> 0;
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
     * Reads a null-terminated string from the buffer, byte by byte,
     * until a zero byte is found or the optional length limit is reached.
     *
     * @public
     * @param {number=} length - Maximum number of bytes to read.
     * @returns {string} The decoded string.
     */
    readString(length) {
        let result = '';

        while (true) {
            if (Number.isInteger(length) && result.length >= length) {
                break;
            }

            const buffer = this.read(BITS_PER_BYTE);

            if (buffer[0] === 0) {
                break;
            }

            result += buffer.toString();
        }

        return result;
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

        while (bitsAvailable >= BITS_PER_BYTE && offset < UVarInt32.MAXIMUM_SIZE_BYTES) {
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
     * Reads a variable-length unsigned integer representing a part of the {@link FieldPath}.
     * The number of bits read depends on a series of flags (prefix bits).
     *
     * @public
     * @returns {Number}
     */
    readUVarIntFieldPath() {
        let flag;

        flag = this.readBit();

        if (flag) {
            return this._read(2).readUInt8() >>> 0;
        }

        flag = this.readBit();

        if (flag) {
            return this._read(4).readUInt8() >>> 0;
        }

        flag = this.readBit();

        if (flag) {
            return this._read(10).readUInt16LE() >>> 0;
        }

        flag = this.readBit();

        if (flag) {
            return Buffer.concat([ this._read(17), Buffer.alloc(1) ]).readUInt32LE() >>> 0;
        }

        return this._read(31).readUInt32LE() >>> 0;
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
     * @protected
     * @param {Number} numberOfBits
     * @returns {Buffer}
     */
    _read(numberOfBits) {
        throw new Error('BitBuffer._read() is not implemented');
    }
}

module.exports = BitBuffer;
