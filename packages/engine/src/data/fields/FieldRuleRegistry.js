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
     * @returns {FieldRuleRegistrySnapshot}
     */
    export() {
        return {
            fieldDecoderOverrides: [ ...this._fieldDecoderOverrides ].map(([ name, descriptor ]) => ({
                name,
                descriptor: descriptor.export()
            })),
            fieldEncoderOverrides: [ ...this._fieldEncoderOverrides ].map(([ name, encoder ]) => ({
                name,
                encoder
            })),
            fixedTableTypes: [ ...this._fixedTableTypes ],
            typeDecoders: [ ...this._typeDecoders ].map(([ baseType, descriptor ]) => ({
                baseType,
                descriptor: descriptor.export()
            })),
            variableArrayTypes: [ ...this._variableArrayTypes ]
        };
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
     * @static
     * @param {FieldRuleRegistrySnapshot|null} data
     * @returns {FieldRuleRegistry}
     */
    static reconstruct(data) {
        const registry = new FieldRuleRegistry();

        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
            return registry;
        }

        (Array.isArray(data.fieldDecoderOverrides) ? data.fieldDecoderOverrides : []).forEach(({ name, descriptor }) => {
            registry.registerFieldDecoderOverride(name, FieldDecoderDescriptor.reconstruct(descriptor));
        });

        (Array.isArray(data.fieldEncoderOverrides) ? data.fieldEncoderOverrides : []).forEach(({ name, encoder }) => {
            registry.registerFieldEncoderOverride(name, encoder);
        });

        (Array.isArray(data.fixedTableTypes) ? data.fixedTableTypes : []).forEach(baseType => {
            registry.registerFixedTableType(baseType);
        });

        (Array.isArray(data.typeDecoders) ? data.typeDecoders : []).forEach(({ baseType, descriptor }) => {
            registry.registerFieldTypeDecoder(baseType, FieldDecoderDescriptor.reconstruct(descriptor));
        });

        (Array.isArray(data.variableArrayTypes) ? data.variableArrayTypes : []).forEach(baseType => {
            registry.registerVariableArrayType(baseType);
        });

        return registry;
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
 * @typedef {{ type: string, options: object }} FieldDecoderDescriptorSnapshot
 * @typedef {{ name: string, descriptor: FieldDecoderDescriptorSnapshot }} FieldDecoderOverrideSnapshot
 * @typedef {{ name: string, encoder: string }} FieldEncoderOverrideSnapshot
 * @typedef {{ baseType: string, descriptor: FieldDecoderDescriptorSnapshot }} FieldTypeDecoderSnapshot
 * @typedef {{
 *   fieldDecoderOverrides: FieldDecoderOverrideSnapshot[],
 *   fieldEncoderOverrides: FieldEncoderOverrideSnapshot[],
 *   fixedTableTypes: string[],
 *   typeDecoders: FieldTypeDecoderSnapshot[],
 *   variableArrayTypes: string[]
 * }} FieldRuleRegistrySnapshot
 */

export default FieldRuleRegistry;
