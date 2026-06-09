import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';

class FieldArrayVariable extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {FieldDecoder} fieldDecoderBase
     * @param {FieldDecoder} fieldDecoderChild
     */
    constructor(name, sendNode, fieldDecoderBase, fieldDecoderChild) {
        super(name, sendNode);

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
            return `${this._name}.${String(fieldPath.get(index)).padStart(4, '0')}`;
        }

        return this._name;
    }
}

export default FieldArrayVariable;
