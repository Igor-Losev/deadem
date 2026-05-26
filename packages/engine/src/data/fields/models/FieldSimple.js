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
     * @param {FieldDecoder} fieldDecoder
     */
    constructor(name, sendNode, fieldDecoder) {
        super(name, sendNode);

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
