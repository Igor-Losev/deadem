import assert from 'assert/strict';

import BitBuffer from './../../buffer/BitBuffer.js';

import FieldDecoder from './FieldDecoder.js';
import FieldDecoderInstructions from './../FieldDecoderInstructions.js';

const DEFAULT_BIT_COUNT = 0;
const DEFAULT_VALUE_LOW = 0;
const DEFAULT_VALUE_HIGH = 1;
const DEFAULT_FLAG = 0;

const FLAG_ROUND_DOWN = 1 << 0;
const FLAG_ROUND_UP = 1 << 1;
const FLAG_ENCODE_ZERO = 1 << 2;
const FLAG_ENCODE_INTEGERS = 1 << 3;

class FieldDecoderQuantizedFloat extends FieldDecoder {
    /**
     * @constructor
     * @param {FieldDecoderInstructions} instructions
     */
    constructor(instructions) {
        super();

        assert(instructions instanceof FieldDecoderInstructions);

        this._low = typeof instructions.valueLow === 'number' ? instructions.valueLow : DEFAULT_VALUE_LOW;
        this._high = typeof instructions.valueHigh === 'number' ? instructions.valueHigh : DEFAULT_VALUE_HIGH;

        this._quantizationMultiplier = 0;
        this._dequantizationStep = 0;

        const bitCount = typeof instructions.bitCount === 'number' ? instructions.bitCount : DEFAULT_BIT_COUNT;
        const flags = typeof instructions.encoderFlags === 'number' ? instructions.encoderFlags : DEFAULT_FLAG;

        if (bitCount === 0 || bitCount >= 32) {
            this._bitCount = 32;
            this._flags = flags;

            return;
        }

        this._bitCount = bitCount;
        this._flags = getFlags.call(this, flags);

        let steps = (1 << bitCount) >>> 0;
        let range = this._high - this._low;
        let offset = range / steps;

        if ((this._flags & FLAG_ROUND_DOWN) !== 0) {
            this._high -= offset;
        } else if ((this._flags & FLAG_ROUND_UP) !== 0) {
            this._low += offset;
        }

        if ((this._flags & FLAG_ENCODE_INTEGERS) !== 0) {
            const delta = Math.max(this._high - this._low, 1);

            // Calculate the next power of two that is >= delta
            const deltaLog2 = Math.ceil(Math.log2(delta));

            range = (1 << deltaLog2) >>> 0;

            this._bitCount = Math.max(bitCount, deltaLog2);

            steps = (1 << bitCount) >>> 0;
            offset = range / steps;

            // Adjust the high value to prevent overflow during decoding
            this._high = this._low + range - offset;
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
        if ((this._flags & FLAG_ROUND_DOWN) !== 0 && bitBuffer.readBit() === 1) {
            return this._low;
        }

        if ((this._flags & FLAG_ROUND_UP) !== 0 && bitBuffer.readBit() === 1) {
            return this._high;
        }

        if ((this._flags & FLAG_ENCODE_ZERO) !== 0 && bitBuffer.readBit() === 1) {
            return 0;
        }

        const value = BitBuffer.readUInt32LE(bitBuffer.read(this._bitCount));

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

        const integer = Math.floor((number - this._low) * this._quantizationMultiplier);

        return this._low + (this._high - this._low) * integer * this._dequantizationStep;
    }
}

/**
 * @param {number} steps
 * @returns {number}
 */
function assignMultipliers(steps) {
    assert(Number.isInteger(steps));

    const range = this._high - this._low;

    let high;

    if (this._bitCount === 32) {
        high = 0xFFFFFFFE;
    } else {
        high = ((1 << this._bitCount) >>> 0) - 1;
    }

    let multiplier;

    if (Math.abs(range) <= 0) {
        multiplier = high;
    } else {
        multiplier = high / range;
    }

    if (multiplier * range > high) {
        const multipliers = [ 0.9999, 0.99, 0.8, 0.7 ];

        for (const m of multipliers) {
            multiplier = high / (range * m);

            if (multiplier * range <= high) {
                break;
            }
        }
    }

    if (multiplier === 0) {
        throw new Error('Multiplier is zero. This should never happen');
    }

    this._quantizationMultiplier = multiplier;
    this._dequantizationStep = 1 / (steps - 1);
}

/**
 * Validates and recalculates decoder flags for quantized float decoding.
 *
 * @param {number} candidate
 * @returns {number}
 */
function getFlags(candidate) {
    assert(Number.isInteger(candidate));

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
