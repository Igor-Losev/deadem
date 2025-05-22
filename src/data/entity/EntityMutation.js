'use strict';

class EntityMutation {
    /**
     * @constructor
     * @param {FieldPath} fieldPath
     * @param {*} value
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
     * @returns {*}
     */
    get value() {
        return this._value;
    }
}

module.exports = EntityMutation;
