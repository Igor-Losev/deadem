import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '../Field.js';

class ArrayFixedField extends Field {
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
        return FieldModel.ARRAY_FIXED;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 === index) {
            return `${this._name}.${String(fieldPath.get(index)).padStart(4, '0')}`;
        }

        return this._name;
    }
}

export default ArrayFixedField;
