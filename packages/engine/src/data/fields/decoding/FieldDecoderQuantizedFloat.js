/** @import BitBuffer from '../../../core/BitBuffer.js' */

import Assert from '../../../core/Assert.js';

import FieldDecoderInstructions from './FieldDecoderInstructions.js';

const DEFAULT_BIT_COUNT = 0;
const DEFAULT_VALUE_LOW = 0;
const DEFAULT_VALUE_HIGH = 1;
const DEFAULT_FLAG = 0;

const FLAG_ROUND_DOWN = 1 << 0;
const FLAG_ROUND_UP = 1 << 1;
const FLAG_ENCODE_ZERO = 1 << 2;
const FLAG_ENCODE_INTEGERS = 1 << 3;

const MULTIPLIER_ADJUSTMENTS = [ 0.9999, 0.99, 0.9, 0.8, 0.7 ];

class FieldDecoderQuantizedFloat {
    /**
     * @constructor
     * @param {FieldDecoderInstructions} instructions
     */
    constructor(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        this._low = typeof instructions.valueLow === 'number' ? instructions.valueLow : DEFAULT_VALUE_LOW;
        this._high = typeof instructions.valueHigh === 'number' ? instructions.valueHigh : DEFAULT_VALUE_HIGH;

        this._quantizationMultiplier = 0;
        this._dequantizationStep = 0;

        const bitCount = typeof instructions.bitCount === 'number' ? instructions.bitCount : DEFAULT_BIT_COUNT;
        const flags = typeof instructions.encoderFlags === 'number' ? instructions.encoderFlags : DEFAULT_FLAG;

        if (bitCount === 0 || bitCount >= 32) {
            this._bitCount = 32;
            /** @private */
            this._flags = flags;

            return;
        }

        this._bitCount = bitCount;
        this._flags = getFlags.call(this, flags);

        let steps = 2 ** bitCount;

        if ((this._flags & FLAG_ROUND_DOWN) !== 0) {
            this._high = Math.fround(this._high - Math.fround(this._high - this._low) / steps);
        } else if ((this._flags & FLAG_ROUND_UP) !== 0) {
            this._low = Math.fround(this._low + Math.fround(this._high - this._low) / steps);
        }

        if ((this._flags & FLAG_ENCODE_INTEGERS) !== 0) {
            const range = 2 ** getBitLength(Math.max(Math.trunc(this._high) - Math.trunc(this._low), 1));

            while (2 ** this._bitCount <= range) {
                this._bitCount += 1;
            }

            steps = 2 ** this._bitCount;

            this._high = Math.fround(Math.fround(this._low + range) - range / steps);
        }

        assignMultipliers.call(this, steps);

        if ((this._flags & FLAG_ROUND_DOWN) !== 0) {
            if (this.quantize(this._low) === this._low) {
                this._flags &= ~FLAG_ROUND_DOWN;
            }
        }

        if ((this._flags & FLAG_ROUND_UP) !== 0) {
            if (this.quantize(this._high) === this._high) {
                this._flags &= ~FLAG_ROUND_UP;
            }
        }

        if ((this._flags & FLAG_ENCODE_ZERO) !== 0) {
            if (this.quantize(0) === 0) {
                this._flags &= ~FLAG_ENCODE_ZERO;
            }
        }
    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     * @returns {number}
     */
    decode(bitBuffer) {
        if (this._bitCount === 32) {
            return bitBuffer.readFloat32();
        }

        if ((this._flags & FLAG_ROUND_DOWN) !== 0 && bitBuffer.readBit()) {
            return this._low;
        }

        if ((this._flags & FLAG_ROUND_UP) !== 0 && bitBuffer.readBit()) {
            return this._high;
        }

        if ((this._flags & FLAG_ENCODE_ZERO) !== 0 && bitBuffer.readBit()) {
            return 0;
        }

        const value = bitBuffer.readBitsAsUInt(this._bitCount);

        return this._low + (this._high - this._low) * value * this._dequantizationStep;
    }

    /**
     * Maps a float value within the [low, high] range to a discrete quantized value.
     *
     * @public
     * @param {number} number
     * @returns {number}
     */
    quantize(number) {
        if (number < this._low) {
            if ((this._flags & FLAG_ROUND_UP) === 0) {
                throw new Error('quantize() error: value out of range');
            }

            return this._low;
        } else if (number > this._high) {
            if ((this._flags & FLAG_ROUND_DOWN) === 0) {
                throw new Error('quantize() error: value out of range');
            }

            return this._high;
        }

        if (this._quantizationMultiplier === 0) {
            throw new Error('quantize() error: multiplier is zero');
        }

        const scaled = Math.fround(Math.fround(number - this._low) * this._quantizationMultiplier);
        const integer = Math.trunc(Math.fround(scaled + 0.5));
        const fraction = Math.fround(Math.fround(integer) * Math.fround(this._dequantizationStep));

        return Math.fround(this._low + Math.fround(Math.fround(this._high - this._low) * fraction));
    }
}

/**
 * @this {FieldDecoderQuantizedFloat}
 * @param {number} steps
 */
function assignMultipliers(steps) {
    Assert.isTrue(Number.isInteger(steps));

    const range = Math.fround(this._high - this._low);

    let high;

    if (this._bitCount === 32) {
        high = 0xFFFFFFFE;
    } else {
        high = 2 ** this._bitCount - 1;
    }

    let multiplier;

    if (Math.abs(range) <= 0) {
        multiplier = Math.fround(high);
    } else {
        multiplier = Math.fround(Math.fround(high) / range);
    }

    if (Math.fround(multiplier * range) > high) {
        for (const adjustment of MULTIPLIER_ADJUSTMENTS) {
            multiplier = Math.fround(Math.fround(Math.fround(high) / range) * Math.fround(adjustment));

            if (Math.fround(multiplier * range) <= high) {
                break;
            }
        }
    }

    this._quantizationMultiplier = multiplier;
    this._dequantizationStep = 1 / (steps - 1);
}

/**
 * @param {number} value
 * @returns {number}
 */
function getBitLength(value) {
    return 32 - Math.clz32(value);
}

/**
 * Validates and recalculates decoder flags for quantized float decoding.
 *
 * @this {FieldDecoderQuantizedFloat}
 * @param {number} candidate
 * @returns {number}
 */
function getFlags(candidate) {
    Assert.isTrue(Number.isInteger(candidate));

    let flags = candidate;

    if (flags === 0) {
        return flags;
    }

    const getIsEncodeIntegers = () => (flags & FLAG_ENCODE_INTEGERS) !== 0;
    const getIsEncodeZero = () => (flags & FLAG_ENCODE_ZERO) !== 0;
    const getIsRoundUp = () => (flags & FLAG_ROUND_UP) !== 0;
    const getIsRoundDown = () => (flags & FLAG_ROUND_DOWN) !== 0;

    // If low is zero and round-down is enabled, or high is zero and round-up is enabled,
    // then encoding zero becomes redundant — so remove the encode-zero flag
    if ((this._low === 0 && getIsRoundDown()) || (this._high === 0 && getIsRoundUp())) {
        flags &= ~FLAG_ENCODE_ZERO;
    }

    // If low is zero and encode-zero is set,
    // switch to using round-down instead and remove encode-zero
    if (this._low === 0 && getIsEncodeZero()) {
        flags |= FLAG_ROUND_DOWN;
        flags &= ~FLAG_ENCODE_ZERO;
    }

    // If high is zero and encode-zero is set,
    // switch to using round-up instead and remove encode-zero
    if (this._high === 0 && getIsEncodeZero()) {
        flags |= FLAG_ROUND_UP;
        flags &= ~FLAG_ENCODE_ZERO;
    }

    // If the range does not include zero (completely above or below zero),
    // then there's no reason to encode zero — clear encode-zero flag
    if (this._low > 0 || this._high < 0) {
        flags &= ~FLAG_ENCODE_ZERO;
    }

    // If the only remaining relevant flag is encode-integers,
    // then clear rounding and encode-zero flags to simplify behavior
    if (getIsEncodeIntegers()) {
        flags &= ~(FLAG_ROUND_UP | FLAG_ROUND_DOWN | FLAG_ENCODE_ZERO);
    }

    // RoundUp and RoundDown cannot be set together
    if ((flags & (FLAG_ROUND_UP | FLAG_ROUND_DOWN)) === (FLAG_ROUND_UP | FLAG_ROUND_DOWN)) {
        throw new Error('Both flags FLAG_ROUND_UP and FLAG_ROUND_DOWN are set. This should never happen');
    }

    return flags;
}

export default FieldDecoderQuantizedFloat;
