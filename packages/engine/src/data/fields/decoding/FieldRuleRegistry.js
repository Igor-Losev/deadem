import Assert from '#core/Assert.js';

import FieldDecoderDescriptor from './FieldDecoderDescriptor.js';

class FieldRuleRegistry {
    /**
     * @constructor
     */
    constructor() {
        this._typeDecoders = new Map();
        this._fixedTableTypes = new Set();
        this._variableArrayTypes = new Set();
        this._fieldDecoderOverrides = new Map();
        this._fieldEncoderOverrides = new Map();
    }

    /**
     * @public
     * @returns {Object}
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
     * @param {String} name
     * @returns {FieldDecoderDescriptor|null}
     */
    getFieldDecoderOverride(name) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);

        return this._fieldDecoderOverrides.get(name) || null;
    }

    /**
     * @public
     * @param {String} name
     * @returns {String|null}
     */
    getFieldEncoderOverride(name) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);

        return this._fieldEncoderOverrides.get(name) || null;
    }

    /**
     * @public
     * @param {String} baseType
     * @returns {FieldDecoderDescriptor|null}
     */
    getFieldTypeDecoder(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._typeDecoders.get(baseType) || null;
    }

    /**
     * @public
     * @param {String} baseType
     * @returns {boolean}
     */
    getIsFixedTableType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._fixedTableTypes.has(baseType);
    }

    /**
     * @public
     * @param {String} baseType
     * @returns {boolean}
     */
    getIsVariableArrayType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        return this._variableArrayTypes.has(baseType);
    }

    /**
     * @public
     * @static
     * @param {Object|null} data
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
     * @param {String} name
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldDecoderOverride(name, descriptor) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);

        this._fieldDecoderOverrides.set(name, descriptor);
    }

    /**
     * @public
     * @param {String} name
     * @param {String} encoder
     */
    registerFieldEncoderOverride(name, encoder) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(typeof encoder === 'string' && encoder.length > 0);

        this._fieldEncoderOverrides.set(name, encoder);
    }

    /**
     * @public
     * @param {String} baseType
     * @param {FieldDecoderDescriptor} descriptor
     */
    registerFieldTypeDecoder(baseType, descriptor) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);

        this._typeDecoders.set(baseType, descriptor);
    }

    /**
     * @public
     * @param {String} baseType
     */
    registerFixedTableType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        this._fixedTableTypes.add(baseType);
    }

    /**
     * @public
     * @param {String} baseType
     */
    registerVariableArrayType(baseType) {
        Assert.isTrue(typeof baseType === 'string' && baseType.length > 0);

        this._variableArrayTypes.add(baseType);
    }
}

export default FieldRuleRegistry;
