'use strict';

const assert = require('node:assert/strict');

class FieldDecoderInstructions {
    /**
     * @public
     * @constructor
     * @param {String|null} encoder
     * @param {Number|null} encoderFlags
     * @param {Number|null} bitCount
     * @param {Number|null} valueLow
     * @param {Number|null} valueHigh
     */
    constructor(encoder, encoderFlags, bitCount, valueLow, valueHigh) {
        assert(encoder === null || typeof encoder === 'string');
        assert(encoderFlags === null || Number.isInteger(encoderFlags));
        assert(bitCount === null || Number.isInteger(bitCount));
        assert(valueLow === null || typeof valueLow === 'number');
        assert(valueHigh === null || typeof valueHigh === 'number');

        this._encoder = encoder;
        this._encoderFlags = encoderFlags;
        this._bitCount = bitCount;
        this._valueLow = valueLow;
        this._valueHigh = valueHigh;
    }

    /**
     * @returns {String|null}
     */
    get encoder() {
        return this._encoder;
    }

    /**
     * @param {String|null} value
     */
    set encoder(value) {
        return this._encoder = value;
    }

    /**
     * @returns {Number|null}
     */
    get encoderFlags() {
        return this._encoderFlags;
    }

    /**
     * @returns {Number|null}
     */
    get bitCount() {
        return this._bitCount;
    }

    /**
     * @returns {Number|null}
     */
    get valueLow() {
        return this._valueLow;
    }

    /**
     * @returns {Number|null}
     */
    get valueHigh() {
        return this._valueHigh;
    }
}

module.exports = FieldDecoderInstructions;
