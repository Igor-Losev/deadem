/** @import FieldExtractor from '../FieldExtractor.js' */
/** @import FieldDefinition from '../FieldDefinition.js' */
/** @import FieldStorageDescriptor from '../decoding/FieldStorageDescriptor.js' */
/** @import FieldPath from '../path/FieldPath.js' */
/** @import { FieldDecoderFn } from '../decoding/FieldDecoder.js' */

import Assert from '../../../core/Assert.js';

import FieldModel from '../../enums/FieldModel.js';

import Field from '../Field.js';
import FieldDecoder from '../decoding/FieldDecoder.js';
import Serializer from '../Serializer.js';

class FieldArrayFixed extends Field {
    /**
     * @public
     * @constructor
     * @param {string} name
     * @param {Array<string>} sendNode
     * @param {FieldDefinition} definition
     * @param {FieldDecoder} fieldDecoder
     */
    constructor(name, sendNode, definition, fieldDecoder) {
        super(name, sendNode, definition);

        Assert.isTrue(fieldDecoder instanceof FieldDecoder);

        /** @private */
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
     * @returns {FieldDecoderFn}
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
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath() {
        return this._fieldDecoder.storage;
    }

    /**
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Array<*>|undefined}
     */
    unpack(extractor) {
        const count = /** @type {number} */ (this._definition.count);
        const out = new Array(count);

        let present = 0;

        for (let i = 0; i < count; i++) {
            out[i] = extractor.at(i);

            if (out[i] !== undefined) {
                present++;
            }
        }

        return present > 0 ? out : undefined;
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
