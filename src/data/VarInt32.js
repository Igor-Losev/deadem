'use strict';

const MAXIMUM_SIZE_BYTES = 5;

/**
 * Represents a variable-length 32-bit integer
 * and tracks how many bytes were used to encode it.
 */
class VarInt32 {
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
     * Parses a {@link VarInt32} from the provided buffer.
     *
     * @public
     * @static
     * @param {Buffer} buffer - The buffer from which to parse the value.
     * @returns {VarInt32|null} - The parsed {@link VarInt32} or null if parsing failed.
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

        return new VarInt32(value, offset);
    }
}

module.exports = VarInt32;
