/** @import FieldDefinition from '#data/fields/FieldDefinition.js' */

import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '#data/fields/Field.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';

class FieldSimple extends Field {
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
        return FieldModel.SIMPLE;
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
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath() {
        return this._fieldDecoder.storage;
    }

    /**
     * @public
     * @returns {String}
     */
    getNameForFieldPath() {
        return this._name;
    }
}

export default FieldSimple;
