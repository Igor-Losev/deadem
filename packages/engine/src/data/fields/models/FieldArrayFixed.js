/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import Serializer from '#data/fields/Serializer.js';

class FieldArrayFixed extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {FieldDefinition} definition
     * @param {FieldDecoder} fieldDecoder
     */
    constructor(name, sendNode, definition, fieldDecoder) {
        super(name, sendNode, definition);

        Assert.isTrue(fieldDecoder instanceof FieldDecoder);

        this._fieldDecoder = fieldDecoder;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        return FieldModel.ARRAY_FIXED;
    }

    /**
     * @public
     * @returns {Function}
     */
    getDecoderForFieldPath() {
        return this._fieldDecoder.fn;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {boolean}
     */
    getIsContainerForFieldPath(fieldPath, index) {
        return index >= fieldPath.length;
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
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath() {
        return this._fieldDecoder.storage;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Array<*>}
     */
    unpack(extractor) {
        const count = this._definition.count;
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

export default FieldArrayFixed;
