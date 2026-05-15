import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from '../Field.js';
import Serializer from '../Serializer.js';

class TableVariableField extends Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {Serializer} serializer
     * @param {Function} decoderBase
     */
    constructor(name, sendNode, serializer, decoderBase) {
        super(name, sendNode);

        Assert.isTrue(serializer instanceof Serializer);
        Assert.isTrue(typeof decoderBase === 'function');

        this._serializer = serializer;
        this._decoderBase = decoderBase;
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
     * @returns {FieldModel}
     */
    get model() {
        return FieldModel.TABLE_VARIABLE;
    }

    /**
     * @public
     * @returns {Serializer}
     */
    get serializer() {
        return this._serializer;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {Function}
     */
    getDecoderForFieldPath(fieldPath, index) {
        if (fieldPath.length - 1 >= index + 1) {
            return this._serializer.getDecoderForFieldPath(fieldPath, index + 1);
        }

        return this._decoderBase;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {String}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        if (fieldPath.length - 1 !== index - 1) {
            const parts = [ this._name, String(fieldPath.get(index)).padStart(4, '0') ];

            if (fieldPath.length - 1 !== index) {
                parts.push(this._serializer.getNameForFieldPath(fieldPath, index + 1));
            }

            return parts.join('.');
        }

        return this._name;
    }
}

export default TableVariableField;
