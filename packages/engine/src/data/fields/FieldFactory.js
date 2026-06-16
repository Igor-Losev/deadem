import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import FieldDefinition from './FieldDefinition.js';

import FieldDecoder from './decoding/FieldDecoder.js';
import FieldDecoderCatalog from './decoding/FieldDecoderCatalog.js';
import FieldDecoderFactory from './decoding/FieldDecoderFactory.js';
import FieldDecoderInstructionsFactory from './decoding/FieldDecoderInstructionsFactory.js';
import FieldStorageDescriptor from './decoding/FieldStorageDescriptor.js';

import FieldRuleRegistry from './FieldRuleRegistry.js';

import FieldArrayFixed from './models/FieldArrayFixed.js';
import FieldArrayVariable from './models/FieldArrayVariable.js';
import FieldSimple from './models/FieldSimple.js';
import FieldTableFixed from './models/FieldTableFixed.js';
import FieldTableVariable from './models/FieldTableVariable.js';

class FieldFactory {
    /**
     * @constructor
     * @param {FieldRuleRegistry} fieldRuleRegistry
     */
    constructor(fieldRuleRegistry) {
        Assert.isTrue(fieldRuleRegistry instanceof FieldRuleRegistry);

        this._fieldRuleRegistry = fieldRuleRegistry;

        this._decoderCatalog = new FieldDecoderCatalog();
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

        const model = this._classify(definition, serializer);

        switch (model) {
            case FieldModel.SIMPLE:
                return new FieldSimple(name, sendNode, this._resolveDecoder(name, definition.baseType, decoderInstructions));
            case FieldModel.ARRAY_FIXED:
                return new FieldArrayFixed(name, sendNode, this._resolveDecoder(name, definition.baseType, decoderInstructions));
            case FieldModel.ARRAY_VARIABLE:
                Assert.isTrue(definition.generic !== null, 'ARRAY_VARIABLE field requires a generic definition');

                return new FieldArrayVariable(name, sendNode, VAR_UINT_32_DECODER, this._resolveDecoder(name, definition.generic.baseType, decoderInstructions));
            case FieldModel.TABLE_FIXED:
                return new FieldTableFixed(name, sendNode, serializer, this._resolveDecoderOverride(name, decoderInstructions) || BOOLEAN_DECODER);
            case FieldModel.TABLE_VARIABLE:
                return new FieldTableVariable(name, sendNode, serializer, this._resolveDecoderOverride(name, decoderInstructions) || VAR_UINT_32_DECODER);
            default:
                throw new Error(`Unhandled field model [ ${model.code} ]`);
        }
    }

    /**
     * @protected
     * @param {FieldDefinition} definition
     * @param {Serializer|null} serializer
     * @returns {FieldModel}
     */
    _classify(definition, serializer) {
        if (serializer !== null) {
            if (definition.pointer || this._fieldRuleRegistry.getIsFixedTableType(definition.baseType)) {
                return FieldModel.TABLE_FIXED;
            }

            return FieldModel.TABLE_VARIABLE;
        }

        if (definition.count > 0 && definition.baseType !== 'char') {
            return FieldModel.ARRAY_FIXED;
        }

        if (this._fieldRuleRegistry.getIsVariableArrayType(definition.baseType)) {
            return FieldModel.ARRAY_VARIABLE;
        }

        return FieldModel.SIMPLE;
    }

    /**
     * @protected
     * @param {String} name
     * @param {String} baseType
     * @param {FieldDecoderInstructions} decoderInstructions
     * @returns {FieldDecoder}
     */
    _resolveDecoder(name, baseType, decoderInstructions) {
        const override = this._resolveDecoderOverride(name, decoderInstructions);

        if (override !== null) {
            return override;
        }

        const descriptor = this._fieldRuleRegistry.getFieldTypeDecoder(baseType);

        if (descriptor === null) {
            return VAR_UINT_32_DECODER;
        }

        return this._decoderCatalog.resolve(descriptor, decoderInstructions);
    }

    /**
     * @protected
     * @param {String} name
     * @param {FieldDecoderInstructions} decoderInstructions
     * @returns {FieldDecoder|null}
     */
    _resolveDecoderOverride(name, decoderInstructions) {
        const override = this._fieldRuleRegistry.getFieldDecoderOverride(name);

        if (override === null) {
            return null;
        }

        return this._decoderCatalog.resolve(override, decoderInstructions);
    }
}

const VAR_UINT_32_DECODER = new FieldDecoder(FieldDecoderFactory.VAR_UINT_32, FieldStorageDescriptor.INT_UNSIGNED);
const BOOLEAN_DECODER = new FieldDecoder(FieldDecoderFactory.BOOLEAN, FieldStorageDescriptor.INT_BOOL);

export default FieldFactory;
