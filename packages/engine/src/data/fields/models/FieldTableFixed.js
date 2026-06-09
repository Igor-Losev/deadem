import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import Serializer from '#data/fields/Serializer.js';

class FieldTableFixed extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {Serializer} serializer
     * @param {FieldDecoder} fieldDecoderBase
     */
    constructor(name, sendNode, serializer, fieldDecoderBase) {
        super(name, sendNode);

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
        return FieldModel.TABLE_FIXED;
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
     * @returns {Function}
     */
    getDecoderForFieldPath(fieldPath, index) {
        if (fieldPath.length === index) {
            return this._fieldDecoderBase.fn;
        }

        return this._serializer.getDecoderForFieldPath(fieldPath, index);
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(fieldPath, index) {
        if (fieldPath.length === index) {
            return this._fieldDecoderBase.storage;
        }

        return this._serializer.getStorageForFieldPath(fieldPath, index);
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 >= index) {
            return `${this._name}.${this._serializer.getNameForFieldPath(fieldPath, index)}`;
        }

        return this._name;
    }
}

export default FieldTableFixed;
