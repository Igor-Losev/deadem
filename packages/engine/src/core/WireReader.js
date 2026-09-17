import Assert from '#core/Assert.js';

const MAXIMUM_VAR_INT_64_BYTES = 10;

const WIRE_VAR_INT = 0;
const WIRE_FIXED_64 = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_GROUP_START = 3;
const WIRE_GROUP_END = 4;
const WIRE_FIXED_32 = 5;

const dataView = new DataView(new ArrayBuffer(8));
const textDecoder = new TextDecoder();

/**
 * A class for reading protobuf wire format from {@link Uint8Array}.
 */
class WireReader {
    /**
     * @constructor
     * @param {Uint8Array} buffer
     */
    constructor(buffer) {
        this._buffer = buffer;

        this._offset = 0;
    }

    /**
     * @static
     * @returns {number}
     */
    static get RECURSION_LIMIT() {
        return RECURSION_LIMIT;
    }

    /**
     * @public
     * @returns {number}
     */
    get offset() {
        return this._offset;
    }

    /**
     * @public
     * @param {number} offset
     */
    set offset(offset) {
        this._offset = offset;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._buffer.length;
    }

    /**
     * @public
     * @returns {number}
     */
    getUnreadCount() {
        return this._buffer.length - this._offset;
    }

    /**
     * Reads a variable-length unsigned integer; each byte contributes 7 bits.
     *
     * @public
     * @returns {number}
     */
    readUVarInt32() {
        const buffer = this._buffer;

        let result = 0;
        let offset = 0;

        for (let i = 0; i < MAXIMUM_VAR_INT_64_BYTES; i++) {
            const byte = buffer[this._offset++];

            if (offset < 32) {
                result |= (byte & 0x7f) << offset;
            }

            if ((byte & 0x80) === 0) {
                return result >>> 0;
            }

            offset += 7;
        }

        throw new Error('WireReader: UVarInt32 exceeds the maximum size');
    }

    /**
     * @public
     * @returns {bigint}
     */
    readUVarInt64() {
        const buffer = this._buffer;

        let result = 0n;
        let offset = 0n;

        for (let i = 0; i < MAXIMUM_VAR_INT_64_BYTES; i++) {
            const byte = buffer[this._offset++];

            result |= BigInt(byte & 0x7f) << offset;

            if ((byte & 0x80) === 0) {
                return BigInt.asUintN(64, result);
            }

            offset += 7n;
        }

        throw new Error('WireReader: UVarInt64 exceeds the maximum size');
    }

    /**
     * @public
     * @returns {number}
     */
    readVarInt32() {
        return this.readUVarInt32() | 0;
    }

    /**
     * @public
     * @returns {bigint}
     */
    readVarInt64() {
        return BigInt.asIntN(64, this.readUVarInt64());
    }

    /**
     * Reads a zigzag-encoded signed integer.
     *
     * @public
     * @returns {number}
     */
    readZigZag32() {
        const value = this.readUVarInt32();

        return (value >>> 1) ^ -(value & 1);
    }

    /**
     * @public
     * @returns {bigint}
     */
    readZigZag64() {
        const value = this.readUVarInt64();

        return BigInt.asIntN(64, (value >> 1n) ^ -(value & 1n));
    }

    /**
     * @public
     * @returns {boolean}
     */
    readBoolean() {
        return this.readUVarInt32() !== 0;
    }

    /**
     * @public
     * @returns {number}
     */
    readUInt32() {
        const buffer = this._buffer;
        const offset = this._offset;

        this._offset += 4;

        return (buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
    }

    /**
     * @public
     * @returns {number}
     */
    readInt32() {
        return this.readUInt32() | 0;
    }

    /**
     * @public
     * @returns {bigint}
     */
    readUInt64() {
        dataView.setUint32(0, this.readUInt32(), true);
        dataView.setUint32(4, this.readUInt32(), true);

        return dataView.getBigUint64(0, true);
    }

    /**
     * @public
     * @returns {bigint}
     */
    readInt64() {
        dataView.setUint32(0, this.readUInt32(), true);
        dataView.setUint32(4, this.readUInt32(), true);

        return dataView.getBigInt64(0, true);
    }

    /**
     * @public
     * @returns {number}
     */
    readFloat32() {
        dataView.setUint32(0, this.readUInt32(), true);

        return dataView.getFloat32(0, true);
    }

    /**
     * @public
     * @returns {number}
     */
    readFloat64() {
        dataView.setUint32(0, this.readUInt32(), true);
        dataView.setUint32(4, this.readUInt32(), true);

        return dataView.getFloat64(0, true);
    }

    /**
     * Reads a length-prefixed byte sequence.
     *
     * @public
     * @returns {Uint8Array}
     */
    readBytes() {
        return this.read(this.readUVarInt32());
    }

    /**
     * Reads a length-prefixed UTF-8 string.
     *
     * @public
     * @returns {string}
     */
    readString() {
        return textDecoder.decode(this.read(this.readUVarInt32()));
    }

    /**
     * Reads the given number of bytes without a length prefix.
     *
     * @public
     * @param {number} count
     * @returns {Uint8Array}
     */
    read(count) {
        const start = this._offset;
        const end = start + count;

        if (end > this._buffer.length) {
            throw new Error(`WireReader: cannot read [ ${count} ] byte(s) - only [ ${this._buffer.length - start} ] byte(s) left`);
        }

        this._offset = end;

        return this._buffer.subarray(start, end);
    }

    /**
     * Advances past a field of the given wire type.
     *
     * @public
     * @param {number} wire
     * @param {number} [depth=0]
     * @returns {void}
     */
    skip(wire, depth = 0) {
        if (depth > RECURSION_LIMIT) {
            throw new Error('WireReader: max skip depth exceeded');
        }

        switch (wire) {
            case WIRE_VAR_INT:
                this.readUVarInt64();

                break;
            case WIRE_FIXED_64:
                this._offset += 8;

                break;
            case WIRE_LENGTH_DELIMITED: {
                const length = this.readUVarInt32();

                this._offset += length;

                break;
            }
            case WIRE_GROUP_START: {
                for (;;) {
                    const tag = this.readUVarInt32();

                    if ((tag & 7) === WIRE_GROUP_END) {
                        break;
                    }

                    this.skip(tag & 7, depth + 1);
                }

                break;
            }
            case WIRE_FIXED_32:
                this._offset += 4;

                break;
            default:
                throw new Error(`WireReader: unsupported wire type [ ${wire} ]`);
        }

        Assert.isTrue(this._offset <= this._buffer.length, 'WireReader: skipped past the end of the buffer');
    }
}

const RECURSION_LIMIT = 64;

export default WireReader;
