import assert from 'node:assert/strict';

class FieldDecoderInstructions {
    /**
     * @public
     * @constructor
     * @param {String|null} encoder
     * @param {number|null} encoderFlags
     * @param {number|null} bitCount
     * @param {number|null} valueLow
     * @param {number|null} valueHigh
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
        this._encoder = value;
    }

    /**
     * @returns {number|null}
     */
    get encoderFlags() {
        return this._encoderFlags;
    }

    /**
     * @returns {number|null}
     */
    get bitCount() {
        return this._bitCount;
    }

    /**
     * @returns {number|null}
     */
    get valueLow() {
        return this._valueLow;
    }

    /**
     * @returns {number|null}
     */
    get valueHigh() {
        return this._valueHigh;
    }
}

export default FieldDecoderInstructions;
