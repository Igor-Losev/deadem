import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '../Field.js';

class FieldArrayVariable extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {Function} decoderBase
     * @param {Function} decoderChild
     */
    constructor(name, sendNode, decoderBase, decoderChild) {
        super(name, sendNode);

        Assert.isTrue(typeof decoderBase === 'function');
        Assert.isTrue(typeof decoderChild === 'function');

        this._decoderBase = decoderBase;
        this._decoderChild = decoderChild;
    }

    /**
     * @public
     * @returns {Function}
     */
    get decoderBase() {
        return this._decoderBase;
    }

    /**
     * @public
     * @returns {Function}
     */
    get decoderChild() {
        return this._decoderChild;
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
     * @returns {Function}
     */
    getDecoderForFieldPath(fieldPath, index) {
        return fieldPath.length - 1 === index ? this._decoderChild : this._decoderBase;
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

export default FieldArrayVariable;
