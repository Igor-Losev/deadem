/** @import FieldExtractor from '../FieldExtractor.js' */
/** @import FieldDefinition from '../FieldDefinition.js' */
/** @import FieldStorageDescriptor from '../decoding/FieldStorageDescriptor.js' */
/** @import { FieldDecoderFn } from '../decoding/FieldDecoder.js' */

import Assert from '../../../core/Assert.js';

import FieldModel from '../../enums/FieldModel.js';

import Field from '../Field.js';
import FieldDecoder from '../decoding/FieldDecoder.js';

class FieldScalar extends Field {
    /**
     * @public
     * @constructor
     * @param {Array<string>} sendNode
     * @param {string} varName
     * @param {FieldDefinition} definition
     * @param {FieldDecoder} fieldDecoder
     */
    constructor(sendNode, varName, definition, fieldDecoder) {
        super(sendNode, varName, definition);

        Assert.isTrue(fieldDecoder instanceof FieldDecoder);

        /** @private */
        this._fieldDecoder = fieldDecoder;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        return FieldModel.SCALAR;
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
     * @returns {boolean}
     */
    getIsContainerForFieldPath() {
        return false;
    }

    /**
     * @public
     * @returns {string}
     */
    getNameForFieldPath() {
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
     * @returns {*}
     */
    unpack(extractor) {
        return extractor.read();
    }
}

export default FieldScalar;
