'use strict';

const assert = require('node:assert/strict');

class FieldModel {
    /**
     * @public
     * @constructor
     * @param {String} code
     */
    constructor(code) {
        assert(typeof code === 'string');

        this._code = code;
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @static
     * @returns {FieldModel}
     */
    static get ARRAY_FIXED() {
        return arrayFixed;
    }

    /**
     * @public
     * @static
     * @returns {FieldModel}
     */
    static get ARRAY_VARIABLE() {
        return arrayVariable;
    }

    /**
     * @public
     * @static
     * @returns {FieldModel}
     */
    static get SIMPLE() {
        return simple;
    }

    /**
     * @public
     * @static
     * @returns {FieldModel}
     */
    static get TABLE_FIXED() {
        return tableFixed;
    }

    /**
     * @public
     * @static
     * @returns {FieldModel}
     */
    static get TABLE_VARIABLE() {
        return tableVariable;
    }
}

const arrayFixed = new FieldModel('ARRAY_FIXED');
const arrayVariable = new FieldModel('ARRAY_VARIABLE');
const simple = new FieldModel('SIMPLE');
const tableFixed = new FieldModel('TABLE_FIXED');
const tableVariable = new FieldModel('TABLE_VARIABLE');

module.exports = FieldModel;
