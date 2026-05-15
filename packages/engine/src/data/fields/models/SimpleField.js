import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '../Field.js';

class SimpleField extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {Function} decoder
     */
    constructor(name, sendNode, decoder) {
        super(name, sendNode);

        Assert.isTrue(typeof decoder === 'function');

        this._decoder = decoder;
    }

    /**
     * @public
     * @returns {Function}
     */
    get decoder() {
        return this._decoder;
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
        return this._decoder;
    }

    /**
     * @public
     * @returns {String}
     */
    getNameForFieldPath() {
        return this._name;
    }
}

export default SimpleField;
