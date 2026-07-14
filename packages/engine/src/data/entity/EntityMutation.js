/** @import FieldPath from '#data/fields/path/FieldPath.js' */

class EntityMutation {
    /**
     * @constructor
     * @param {FieldPath} fieldPath
     * @param {unknown} value
     */
    constructor(fieldPath, value) {
        this._fieldPath = fieldPath;
        this._value = value;
    }

    /**
     * @public
     * @returns {FieldPath}
     */
    get fieldPath() {
        return this._fieldPath;
    }

    /**
     * @public
     * @returns {unknown}
     */
    get value() {
        return this._value;
    }
}

export default EntityMutation;
