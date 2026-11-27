import Assert from './Assert.js';
import BitReader from './BitReader.js';

const MAXIMUM_BITS = 32;

/**
 * A class for writing data at the bit level into {@link Uint8Array}.
 *
 * The counterpart of {@link BitReader}.
 */
class BitWriter {
    /** @private @type {Uint8Array} */
    _buffer;

    /** @private @type {number} */
    _pBit = 0;

    /** @private @type {number} */
    _pByte = 0;

    /**
     * @public
     * @constructor
     * @param {number} capacity - Size in bytes.
     */
    constructor(capacity) {
        Assert.isTrue(Number.isInteger(capacity) && capacity >= 0, `Invalid capacity [ ${capacity} ]: expected a non-negative integer`);

        this._buffer = new Uint8Array(capacity);
    }

    /**
     * Returns the written bytes without copying.
     *
     * @public
     * @returns {Uint8Array}
     */
    getBuffer() {
        return this._buffer.subarray(0, this._pBit === 0 ? this._pByte : this._pByte + 1);
    }

    /**
     * @public
     * @param {number} value
     * @param {number} count - Number of bits to write (0-32).
     */
    writeBitsAsUInt(value, count) {
        Assert.isTrue(Number.isInteger(count) && count >= 0 && count <= MAXIMUM_BITS, `Invalid count [ ${count} ]: expected an integer from 0 to ${MAXIMUM_BITS}`);

        this._assertFits(value, count);
        this._assertCapacity(count);

        let remaining = value;
        let written = 0;

        while (written < count) {
            const portion = Math.min(BitReader.BITS_PER_BYTE - this._pBit, count - written);
            const totalBits = this._pBit + portion;

            this._buffer[this._pByte] |= (remaining & ((1 << portion) - 1)) << this._pBit;

            this._pByte += totalBits >>> 3;
            this._pBit = totalBits & 7;

            remaining >>>= portion;
            written += portion;
        }
    }

    /**
     * @public
     * @param {Uint8Array} bytes
     */
    writeBytes(bytes) {
        this._assertCapacity(bytes.length * BitReader.BITS_PER_BYTE);

        if (this._pBit === 0) {
            this._buffer.set(bytes, this._pByte);
            this._pByte += bytes.length;

            return;
        }

        const shift = this._pBit;

        for (let i = 0; i < bytes.length; i++) {
            this._buffer[this._pByte] |= bytes[i] << shift;
            this._pByte += 1;
            this._buffer[this._pByte] = bytes[i] >>> (BitReader.BITS_PER_BYTE - shift);
        }
    }

    /**
     * @public
     * @param {number} value
     */
    writeUInt8(value) {
        this._assertFits(value, BitReader.BITS_PER_BYTE);
        this._assertCapacity(BitReader.BITS_PER_BYTE);

        if (this._pBit === 0) {
            this._buffer[this._pByte] = value;
            this._pByte += 1;

            return;
        }

        this.writeBitsAsUInt(value, BitReader.BITS_PER_BYTE);
    }

    /**
     * @public
     * @param {number} value
     */
    writeUInt32(value) {
        this._assertFits(value, MAXIMUM_BITS);
        this._assertCapacity(MAXIMUM_BITS);

        if (this._pBit === 0) {
            this._buffer[this._pByte] = value;
            this._buffer[this._pByte + 1] = value >>> 8;
            this._buffer[this._pByte + 2] = value >>> 16;
            this._buffer[this._pByte + 3] = value >>> 24;
            this._pByte += 4;

            return;
        }

        this.writeBitsAsUInt(value, MAXIMUM_BITS);
    }

    /**
     * @public
     * @param {number} value
     */
    writeUVarInt(value) {
        this._assertFits(value, MAXIMUM_BITS);

        if (value < 16) {
            this.writeBitsAsUInt(value, 6);
        } else if (value < 256) {
            this.writeBitsAsUInt((value & 15) | 16, 6);
            this.writeBitsAsUInt(value >>> 4, 4);
        } else if (value < 4096) {
            this.writeBitsAsUInt((value & 15) | 32, 6);
            this.writeBitsAsUInt(value >>> 4, 8);
        } else {
            this.writeBitsAsUInt((value & 15) | 48, 6);
            this.writeBitsAsUInt(value >>> 4, 28);
        }
    }

    /**
     * @public
     * @param {number} value
     */
    writeUVarInt32(value) {
        this._assertFits(value, MAXIMUM_BITS);

        let remaining = value;

        while (remaining >= 0x80) {
            this.writeUInt8((remaining & 0x7F) | 0x80);

            remaining >>>= 7;
        }

        this.writeUInt8(remaining);
    }

    /**
     * @private
     * @param {number} bits
     */
    _assertCapacity(bits) {
        const required = this._pByte * BitReader.BITS_PER_BYTE + this._pBit + bits;

        Assert.isTrue(required <= this._buffer.length * BitReader.BITS_PER_BYTE, `Unable to write: [ ${required} ] bits exceed the capacity of [ ${this._buffer.length} ] bytes`);
    }

    /**
     * @private
     * @param {number} value
     * @param {number} bits
     */
    _assertFits(value, bits) {
        Assert.isTrue(Number.isInteger(value) && value >= 0 && value < 2 ** bits, `Invalid value [ ${value} ]: expected an unsigned integer of [ ${bits} ] bits`);
    }
}

export default BitWriter;
