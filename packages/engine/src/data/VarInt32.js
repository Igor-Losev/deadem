import Assert from '../core/Assert.js';

const MAXIMUM_SIZE_BYTES = 5;
const MAXIMUM_VALUE = 0xFFFFFFFF;
const MINIMUM_VALUE = -(2 ** 31);

/**
 * Represents a variable-length 32-bit integer
 * and tracks how many bytes were used to encode it.
 */
class VarInt32 {
    /**
     * @public
     * @constructor
     * @param {number} value - The decoded signed integer value.
     * @param {number} [size=VarInt32.getSize(value)] - The number of bytes consumed during decoding.
     */
    constructor(value, size = VarInt32.getSize(value)) {
        /** @private */
        this._value = value;
        /** @private */
        this._size = size;
    }

    /**
     * @public
     * @returns {number}
     */
    get value() {
        return this._value;
    }

    /**
     * @public
     * @returns {number}
     */
    get size() {
        return this._size;
    }

    /**
     * @public
     * @static
     * @returns {number}
     */
    static get MAXIMUM_SIZE_BYTES() {
        return MAXIMUM_SIZE_BYTES;
    }

    /**
     * Returns the encoded size. Negative values take five bytes.
     *
     * @public
     * @static
     * @param {number} value
     * @returns {number}
     */
    static getSize(value) {
        Assert.isTrue(Number.isInteger(value) && value >= MINIMUM_VALUE && value <= MAXIMUM_VALUE, `Invalid value [ ${value} ]: expected a 32-bit integer`);

        let size = 1;

        for (let remaining = value >>> 0; remaining >= 0x80; remaining >>>= 7) {
            size += 1;
        }

        return size;
    }

    /**
     * Parses a {@link VarInt32} from the provided buffer.
     *
     * @public
     * @static
     * @param {Uint8Array} buffer - The buffer from which to parse the value.
     * @returns {VarInt32|null} - The parsed {@link VarInt32} or null when the buffer ends inside it.
     */
    static parse(buffer) {
        let continuation = true;
        let offset = 0;
        let value = 0;

        while (continuation && offset < MAXIMUM_SIZE_BYTES) {
            if (offset >= buffer.length) {
                return null;
            }

            const byte = buffer[offset];

            value |= (byte & 127) << (7 * offset);

            offset += 1;

            continuation = (byte & 128) === 128;
        }

        return new VarInt32(value, offset);
    }
}

export default VarInt32;
