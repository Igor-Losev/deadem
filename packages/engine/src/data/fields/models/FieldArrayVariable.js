/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import Serializer from '#data/fields/Serializer.js';

class FieldArrayVariable extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {FieldDefinition} definition
     * @param {FieldDecoder} fieldDecoderBase
     * @param {FieldDecoder} fieldDecoderChild
     */
    constructor(name, sendNode, definition, fieldDecoderBase, fieldDecoderChild) {
        super(name, sendNode, definition);

        Assert.isTrue(fieldDecoderBase instanceof FieldDecoder);
        Assert.isTrue(fieldDecoderChild instanceof FieldDecoder);

        this._fieldDecoderBase = fieldDecoderBase;
        this._fieldDecoderChild = fieldDecoderChild;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        return FieldModel.ARRAY_VARIABLE;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {Function}
     */
    getDecoderForFieldPath(fieldPath, index) {
        return (fieldPath.length - 1 === index ? this._fieldDecoderChild : this._fieldDecoderBase).fn;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(fieldPath, index) {
        return (fieldPath.length - 1 === index ? this._fieldDecoderChild : this._fieldDecoderBase).storage;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 === index) {
            return Serializer.formatElementIndex(this._name, fieldPath.get(index));
        }

        return this._name;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Array<*>|undefined}
     */
    unpack(extractor) {
        const count = extractor.read();

        if (typeof count !== 'number' || count < 0) {
            return undefined;
        }

        const out = new Array(count);

        for (let i = 0; i < count; i++) {
            out[i] = extractor.at(i);
        }

        return out;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @param {number} index
     * @returns {*}
     */
    unpackElement(extractor, index) {
        return extractor.at(index);
    }
}

export default FieldArrayVariable;
