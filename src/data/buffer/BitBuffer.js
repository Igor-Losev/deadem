'use strict';

const UVarInt32 = require('./../UVarInt32');

const BITS_PER_BYTE = 8;

class BitBuffer {
    /**
     * @abstract
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

    static get BITS_PER_BYTE() {
        return BITS_PER_BYTE;
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
        return this._read(numberOfBits);
    }

    /**
     * @public
     *
     * @returns {number}
     */
    readBit() {
        const buffer = this._read(1);

        return buffer[0] >>> 0;
    }

    /**
     * @public
     *
     * @param {number=} length
     * @returns {string}
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
     * @public
     *
     * @returns {number}
     */
    readUInt8() {
        const buffer = this._read(BITS_PER_BYTE);

        return buffer[0] >>> 0;
    }

    /**
     * @public
     *
     * @returns {number}
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
     * @public
     *
     * @returns {UVarInt32|null}
     */
    readUVarInt32() {
        let bitsAvailable = this.getUnreadCount();
        let valid = false;
        let value = 0;
        let offset = 0;

        while (bitsAvailable >= BITS_PER_BYTE && offset < UVarInt32.MAXIMUM_SIZE_BYTES) {
            const byte = this.readUInt8();

            bitsAvailable -= BITS_PER_BYTE;

            value |= (byte & 127) << (7 * offset);

            offset += 1;

            if ((byte & 128) !== 128) {
                valid = true;

                break;
            }
        }

        let parsed;

        if (valid) {
            parsed = new UVarInt32(value >>> 0, offset);
        } else {
            parsed = null;
        }

        return parsed;
    }

    /**
     * @public
     */
    reset() {
        this._pointers.byte = 0;
        this._pointers.bit = 0;
    }

    /**
     * @protected
     * @param {Number} numberOfBits
     *
     * @returns {Buffer}
     */
    _read(numberOfBits) {
        throw new Error('BitBuffer._read() is not implemented');
    }
}

module.exports = BitBuffer;
