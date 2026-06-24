/** @import Field from '#data/fields/Field.js' */
/** @import FieldPath from '#data/fields/path/FieldPath.js' */

import FieldExtractor from '#data/fields/FieldExtractor.js';

/**
 * Compiled, entity-independent plan for reading one field in its natural shape
 * (scalar, array, or object).
 */
class FieldAccessor {
    /**
     * @public
     * @constructor
     * @param {Field} field
     * @param {FieldPath} fieldPath
     * @param {number|null} [elementIndex=null]
     */
    constructor(field, fieldPath, elementIndex = null) {
        this._field = field;
        this._fieldPath = fieldPath;
        this._elementIndex = elementIndex;
    }

    /**
     * The schema field this accessor addresses.
     *
     * @public
     * @returns {Field}
     */
    get field() {
        return this._field;
    }

    /**
     * Field path of the addressed node.
     *
     * @public
     * @returns {FieldPath}
     */
    get fieldPath() {
        return this._fieldPath;
    }

    /**
     * @public
     * @param {function(FieldPath): *} readField
     * @returns {*}
     */
    read(readField) {
        const extractor = new FieldExtractor(readField, this._fieldPath.path);

        if (Number.isInteger(this._elementIndex)) {
            return this._field.unpackElement(extractor, this._elementIndex);
        }

        return this._field.unpack(extractor);
    }
}

export default FieldAccessor;
