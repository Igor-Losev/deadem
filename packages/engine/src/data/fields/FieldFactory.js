import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import FieldDecoderFactory from './FieldDecoderFactory.js';
import FieldDecoderInstructionsFactory from './FieldDecoderInstructionsFactory.js';
import FieldDefinition from './FieldDefinition.js';

import FieldDecoderCatalog from './decoding/FieldDecoderCatalog.js';
import FieldRuleRegistry from './decoding/FieldRuleRegistry.js';

import ArrayFixedField from './models/ArrayFixedField.js';
import ArrayVariableField from './models/ArrayVariableField.js';
import SimpleField from './models/SimpleField.js';
import TableFixedField from './models/TableFixedField.js';
import TableVariableField from './models/TableVariableField.js';

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
                return new SimpleField(name, sendNode, this._resolveDecoder(name, definition.baseType, decoderInstructions));
            case FieldModel.ARRAY_FIXED:
                return new ArrayFixedField(name, sendNode, this._resolveDecoder(name, definition.baseType, decoderInstructions));
            case FieldModel.ARRAY_VARIABLE:
                Assert.isTrue(definition.generic !== null, 'ARRAY_VARIABLE field requires a generic definition');

                return new ArrayVariableField(
                    name,
                    sendNode,
                    FieldDecoderFactory.U_VAR_INT_32,
                    this._resolveDecoder(name, definition.generic.baseType, decoderInstructions)
                );
            case FieldModel.TABLE_FIXED:
                return new TableFixedField(name, sendNode, serializer, FieldDecoderFactory.BOOLEAN);
            case FieldModel.TABLE_VARIABLE:
                return new TableVariableField(name, sendNode, serializer, FieldDecoderFactory.U_VAR_INT_32);
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
     * @returns {Function}
     */
    _resolveDecoder(name, baseType, decoderInstructions) {
        const override = this._fieldRuleRegistry.getFieldDecoderOverride(name);

        if (override !== null) {
            return this._decoderCatalog.resolve(override, decoderInstructions);
        }

        const descriptor = this._fieldRuleRegistry.getFieldTypeDecoder(baseType);

        if (descriptor === null) {
            return FieldDecoderFactory.U_VAR_INT_32;
        }

        return this._decoderCatalog.resolve(descriptor, decoderInstructions);
    }
}

export default FieldFactory;
