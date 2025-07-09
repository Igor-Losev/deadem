import FieldDecoderInstructions from '#data/fields/FieldDecoderInstructions.js';

/**
 * Constructs and caches unique {@link FieldDecoderInstructions} instances.
 * Ensures that no two {@link FieldDecoderInstructions} instances with identical
 * fields are duplicated. If a {@link FieldDecoderInstructions} with the same
 * values has already been created, it returns the existing instance.
 */
class FieldDecoderInstructionsFactory {
    /**
     * @constructor
     */
    constructor() {
        this._registry = new Map();
    }

    /**
     * @public
     * @param {String|null} encoder
     * @param {number|null} encoderFlags
     * @param {number|null} bitCount
     * @param {number|null} valueLow
     * @param {number|null} valueHigh
     */
    build(encoder, encoderFlags, bitCount, valueLow, valueHigh) {
        const key = getKey(encoder, encoderFlags, bitCount, valueLow, valueHigh);

        const existing = this._registry.get(key) || null;

        if (existing !== null) {
            return existing;
        }

        const instructions = new FieldDecoderInstructions(encoder, encoderFlags, bitCount, valueLow, valueHigh);

        this._registry.set(key, instructions);

        return instructions;
    }
}

function getKey(encoder, encoderFlags, bitCount, valueLow, valueHigh) {
    return `${encoder}|${encoderFlags}|${bitCount}|${valueLow}|${valueHigh}`;
}

export default FieldDecoderInstructionsFactory;
