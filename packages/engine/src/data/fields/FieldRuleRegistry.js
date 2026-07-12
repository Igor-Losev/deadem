import Assert from '#core/Assert.js';

import FieldDecoderDescriptor from './decoding/FieldDecoderDescriptor.js';

class FieldRuleRegistry {
    /**
     * @constructor
     */
    constructor() {
        /** @type {FieldDecoderDescriptorMap} */
        this._typeDecoders = new Map();
        /** @type {StringSet} */
        this._fixedTableTypes = new Set();
        /** @type {StringSet} */
        this._variableArrayTypes = new Set();
        /** @type {FieldDecoderDescriptorMap} */
        this._fieldDecoderOverrides = new Map();
        /** @type {StringMap} */
        this._fieldEncoderOverrides = new Map();
    }

    /**
     * @public
     * @param {string} name
     * @returns {FieldDecoderDescriptor|null}
     */
    getFieldDecoderOverride(name) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);

        return this._fieldDecoderOverrides.get(name) || null;
    }

    /**
     * @public
     * @param {string} name
     * @returns {string|null}
     */
    getFieldEncoderOverride(name) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);

        return this._fieldEncoderOverrides.get(name) || null;
    }

    /**
     * @public
     * @param {string} baseType
     * @returns {FieldDecoderDescriptor|null}
     */
    getFieldTypeDecoder(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._typeDecoders.get(baseType) || null;
    }

    /**
     * @public
     * @param {string} baseType
     * @returns {boolean}
     */
    getIsFixedTableType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._fixedTableTypes.has(baseType);
    }

    /**
     * @public
     * @param {string} baseType
     * @returns {boolean}
     */
    getIsVariableArrayType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._variableArrayTypes.has(baseType);
    }

    /**
     * @public
     * @param {string} name
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldDecoderOverride(name, descriptor) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);

        this._fieldDecoderOverrides.set(name, descriptor);
    }

    /**
     * @public
     * @param {string} name
     * @param {string} encoder
     */
    registerFieldEncoderOverride(name, encoder) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(typeof encoder === 'string' && encoder.length > 0);

        this._fieldEncoderOverrides.set(name, encoder);
    }

    /**
     * @public
     * @param {string} baseType
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldTypeDecoder(baseType, descriptor) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);

        this._typeDecoders.set(baseType, descriptor);
    }

    /**
     * @public
     * @param {string} baseType
     */
    registerFixedTableType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        this._fixedTableTypes.add(baseType);
    }

    /**
     * @public
     * @param {string} baseType
     */
    registerVariableArrayType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        this._variableArrayTypes.add(baseType);
    }
}

/**
 * @typedef {Map<string, FieldDecoderDescriptor>} FieldDecoderDescriptorMap
 * @typedef {Map<string, string>} StringMap
 * @typedef {Set<string>} StringSet
 */

export default FieldRuleRegistry;
