'use strict';

const assert = require('node:assert/strict');

class FieldDecoderInstructions {
    /**
     * @public
     * @constructor
     * @param {String=} encoder
     * @param {Number=} encoderFlags
     * @param {Number=} bitCount
     * @param {Number=} valueLow
     * @param {Number=} valueHigh
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

    get encoder() {
        return this._encoder;
    }

    get encoderFlags() {
        return this._encoderFlags;
    }

    get bitCount() {
        return this._bitCount;
    }

    get valueLow() {
        return this._valueLow;
    }

    get valueHigh() {
        return this._valueHigh;
    }
}

module.exports = FieldDecoderInstructions;
