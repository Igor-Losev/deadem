/** @import FieldExtractor from '#data/fields/FieldExtractor.js' */
/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */
/** @import FieldStorageDescriptor from '#data/fields/decoding/FieldStorageDescriptor.js' */
/** @import FieldPath from '#data/fields/path/FieldPath.js' */
/** @import { FieldDecoderFn } from '#data/fields/decoding/FieldDecoder.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import Serializer from '#data/fields/Serializer.js';

class FieldArrayVariable extends Field {
    /**
     * @public
     * @constructor
     * @param {string} name
     * @param {Array<string>} sendNode
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
     * @returns {FieldDecoderFn}
     */
    getDecoderForFieldPath(fieldPath, index) {
        return (fieldPath.length - 1 === index ? this._fieldDecoderChild : this._fieldDecoderBase).fn;
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
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 === index) {
            return Serializer.formatElementIndex(this._name, fieldPath.get(index));
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
        return (fieldPath.length - 1 === index ? this._fieldDecoderChild : this._fieldDecoderBase).storage;
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
