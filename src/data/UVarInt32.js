const MAXIMUM_SIZE_BYTES = 5;

/**
 * Represents an unsigned variable-length 32-bit integer
 * and tracks how many bytes were used to encode it.
 */
class UVarInt32 {
    /**
     * @public
     * @constructor
     * @param {number} value - The decoded unsigned integer value.
     * @param {number} size - The number of bytes consumed during decoding.
     */
    constructor(value, size) {
        this._value = value;
        this._size = size;
    }

    get value() {
        return this._value;
    }

    get size() {
        return this._size;
    }

    static get MAXIMUM_SIZE_BYTES() {
        return MAXIMUM_SIZE_BYTES;
    }

    /**
     * Parses a UVarInt32 from the provided buffer.
     *
     * @public
     * @static
     * @param {Buffer} buffer - The buffer from which to parse the value.
     * @returns {UVarInt32|null} - The parsed UVarInt32 or null if parsing failed.
     */
    static parse(buffer) {
        let continuation = true;
        let offset = 0;
        let value = 0;

        while (continuation && offset < MAXIMUM_SIZE_BYTES) {
            if (continuation && offset >= buffer.length) {
                return null;
            }

            const byte = buffer[offset];

            value |= (byte & 127) << (7 * offset);

            offset += 1;

            continuation = (byte & 128) === 128;
        }

        return new UVarInt32(value >>> 0, offset);
    }
}

module.exports = UVarInt32;
