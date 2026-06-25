/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import Serializer from '#data/fields/Serializer.js';

class FieldTableVariable extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {FieldDefinition} definition
     * @param {Serializer} serializer
     * @param {FieldDecoder} fieldDecoderBase
     */
    constructor(name, sendNode, definition, serializer, fieldDecoderBase) {
        super(name, sendNode, definition);

        Assert.isTrue(serializer instanceof Serializer);
        Assert.isTrue(fieldDecoderBase instanceof FieldDecoder);

        this._serializer = serializer;
        this._fieldDecoderBase = fieldDecoderBase;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        return FieldModel.TABLE_VARIABLE;
    }

    /**
     * @public
     * @returns {Serializer}
     */
    get serializer() {
        return this._serializer;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldDefinition}
     */
    getDefinitionForFieldPath(fieldPath, index) {
        if (fieldPath.length - 1 >= index + 1) {
            return this._serializer.getDefinitionForFieldPath(fieldPath, index + 1);
        }

        return this._definition;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {Function}
     */
    getDecoderForFieldPath(fieldPath, index) {
        if (fieldPath.length - 1 >= index + 1) {
            return this._serializer.getDecoderForFieldPath(fieldPath, index + 1);
        }

        return this._fieldDecoderBase.fn;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {boolean}
     */
    getIsContainerForFieldPath(fieldPath, index) {
        if (fieldPath.length - 1 >= index + 1) {
            return this._serializer.getIsContainerForFieldPath(fieldPath, index + 1);
        }

        return fieldPath.length === index;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 !== index - 1) {
            const base = Serializer.formatElementIndex(this._name, fieldPath.get(index));

            if (fieldPath.length - 1 !== index) {
                return `${base}.${this._serializer.getNameForFieldPath(fieldPath, index + 1)}`;
            }

            return base;
        }

        return this._name;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(fieldPath, index) {
        if (fieldPath.length - 1 >= index + 1) {
            return this._serializer.getStorageForFieldPath(fieldPath, index + 1);
        }

        return this._fieldDecoderBase.storage;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Array<Object>|undefined}
     */
    unpack(extractor) {
        const count = extractor.read();

        if (typeof count !== 'number' || count < 0) {
            return undefined;
        }

        const out = new Array(count);

        for (let i = 0; i < count; i++) {
            extractor.enter(i);

            out[i] = this._serializer.unpack(extractor);

            extractor.exit();
        }

        return out;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @param {number} index
     * @returns {Object|undefined}
     */
    unpackElement(extractor, index) {
        extractor.enter(index);

        const value = this._serializer.unpack(extractor);

        extractor.exit();

        return value;
    }
}

export default FieldTableVariable;
