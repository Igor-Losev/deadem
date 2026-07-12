/** @import FieldExtractor from '#data/fields/FieldExtractor.js' */
/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */
/** @import FieldStorageDescriptor from '#data/fields/decoding/FieldStorageDescriptor.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';

class FieldScalar extends Field {
    /**
     * @public
     * @constructor
     * @param {string} name
     * @param {Array<string>} sendNode
     * @param {FieldDefinition} definition:packages/engine/src/data/fields/models/FieldSimple.js
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
        return FieldModel.SCALAR;
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
