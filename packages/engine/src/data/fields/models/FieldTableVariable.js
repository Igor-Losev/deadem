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
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 !== index - 1) {
            const parts = [ this._name, String(fieldPath.get(index)).padStart(4, '0') ];

            if (fieldPath.length - 1 !== index) {
                parts.push(this._serializer.getNameForFieldPath(fieldPath, index + 1));
            }

            return parts.join('.');
        }

        return this._name;
    }
}

export default FieldTableVariable;
