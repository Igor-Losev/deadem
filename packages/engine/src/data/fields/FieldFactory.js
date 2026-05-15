import Assert from '#core/Assert.js';

import Field from './Field.js';
import FieldDecoderInstructionsFactory from './FieldDecoderInstructionsFactory.js';
import FieldDefinition from './FieldDefinition.js';

import FieldRuleRegistry from './decoding/FieldRuleRegistry.js';

class FieldFactory {
    /**
     * @constructor
     * @param {FieldRuleRegistry} fieldRuleRegistry
     */
    constructor(fieldRuleRegistry) {
        Assert.isTrue(fieldRuleRegistry instanceof FieldRuleRegistry);

        this._fieldRuleRegistry = fieldRuleRegistry;
        this._instructionsFactory = new FieldDecoderInstructionsFactory();
    }

    /**
     * @public
     * @param {String} name
     * @param {FieldDefinition} definition
     * @param {Array<String>} sendNode
     * @param {{encoder: String|null, encoderFlags: number|null, bitCount: number|null, valueLow: number|null, valueHigh: number|null}} instructionsRaw
     * @param {Serializer|null} serializer
     * @returns {Field}
     */
    create(name, definition, sendNode, instructionsRaw, serializer) {
        Assert.isTrue(definition instanceof FieldDefinition);
        Assert.isTrue(instructionsRaw !== null && typeof instructionsRaw === 'object' && !Array.isArray(instructionsRaw));

        const encoderOverride = this._fieldRuleRegistry.getFieldEncoderOverride(name);
        const encoder = encoderOverride !== null ? encoderOverride : instructionsRaw.encoder;

        const decoderInstructions = this._instructionsFactory.build(
            encoder,
            instructionsRaw.encoderFlags,
            instructionsRaw.bitCount,
            instructionsRaw.valueLow,
            instructionsRaw.valueHigh
        );

        return new Field(name, definition, sendNode, decoderInstructions, serializer);
    }
}

export default FieldFactory;
