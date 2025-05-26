import Assert from './../../core/Assert.js';

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
        Assert.isTrue(encoder === null || typeof encoder === 'string');
        Assert.isTrue(encoderFlags === null || Number.isInteger(encoderFlags));
        Assert.isTrue(bitCount === null || Number.isInteger(bitCount));
        Assert.isTrue(valueLow === null || typeof valueLow === 'number');
        Assert.isTrue(valueHigh === null || typeof valueHigh === 'number');

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
