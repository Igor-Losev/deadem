const MAXIMUM_SIZE_BYTES = 5;

class VarInt32 {
    /**
     * @public
     * @constructor
     *
     * @param {Number} value
     * @param {Number} size
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
     * @public
     * @static
     * @param {Buffer} buffer
     *
     * @returns {VarInt32|null}
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
