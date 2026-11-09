import Assert from './Assert.js';

const BITS_PER_BYTE = 8;
const MAXIMUM_BITS = 32;
const MAXIMUM_UINT32 = 0xFFFFFFFF;

/**
 * A class for writing data at the bit level into {@link Uint8Array}.
 * The counterpart of {@link BitReader}.
 */
class BitWriter {
    /** @private @type {Uint8Array} */
    _buffer;

    /** @private @type {{ bit: number, byte: number }} */
    _position = { bit: 0, byte: 0 };

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
    getBytes() {
        return this._buffer.subarray(0, this._position.bit === 0 ? this._position.byte : this._position.byte + 1);
    }

    /**
     * @public
     * @param {number} value
     * @param {number} count - Number of bits to write (0-32).
     */
    writeBitsAsUInt(value, count) {
        Assert.isTrue(Number.isInteger(count) && count >= 0 && count <= MAXIMUM_BITS, `Invalid count [ ${count} ]: expected an integer from 0 to ${MAXIMUM_BITS}`);
        Assert.isTrue(Number.isInteger(value) && value >= 0 && value < 2 ** count, `Invalid value [ ${value} ]: does not fit into [ ${count} ] bits`);

        this._assertCapacity(count);

        let remaining = value;
        let written = 0;

        while (written < count) {
            const portion = Math.min(BITS_PER_BYTE - this._position.bit, count - written);

            this._buffer[this._position.byte] |= (remaining & ((1 << portion) - 1)) << this._position.bit;

            remaining = Math.floor(remaining / (1 << portion));
            written += portion;

            this._advance(portion);
        }
    }

    /**
     * @public
     * @param {Uint8Array} bytes
     */
    writeBytes(bytes) {
        this._assertCapacity(bytes.length * BITS_PER_BYTE);

        if (this._position.bit === 0) {
            this._buffer.set(bytes, this._position.byte);
            this._position.byte += bytes.length;

            return;
        }

        const shift = this._position.bit;

        for (let i = 0; i < bytes.length; i++) {
            this._buffer[this._position.byte] |= bytes[i] << shift;
            this._position.byte += 1;
            this._buffer[this._position.byte] = bytes[i] >>> (BITS_PER_BYTE - shift);
        }
    }

    /**
     * @public
     * @param {number} value
     */
    writeUVarInt(value) {
        this._assertUInt32(value);

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
        this._assertUInt32(value);

        let remaining = value;

        while (remaining >= 0x80) {
            this.writeBitsAsUInt((remaining & 0x7F) | 0x80, BITS_PER_BYTE);

            remaining = Math.floor(remaining / 0x80);
        }

        this.writeBitsAsUInt(remaining, BITS_PER_BYTE);
    }

    /**
     * @private
     * @param {number} bits
     */
    _advance(bits) {
        const total = this._position.bit + bits;

        this._position.byte += total >>> 3;
        this._position.bit = total & 7;
    }

    /**
     * @private
     * @param {number} bits
     */
    _assertCapacity(bits) {
        const required = this._position.byte * BITS_PER_BYTE + this._position.bit + bits;

        Assert.isTrue(required <= this._buffer.length * BITS_PER_BYTE, `Unable to write: [ ${required} ] bits exceed the capacity of [ ${this._buffer.length} ] bytes`);
    }

    /**
     * @private
     * @param {number} value
     */
    _assertUInt32(value) {
        Assert.isTrue(Number.isInteger(value) && value >= 0 && value <= MAXIMUM_UINT32, `Invalid value [ ${value} ]: expected an unsigned 32-bit integer`);
    }
}

export default BitWriter;
