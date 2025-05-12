'use strict';

const assert = require('node:assert/strict');

class FieldModel {
    constructor(code) {
        assert(typeof code === 'string');

        this._code = code;
    }

    get code() {
        return this._code;
    }

    static get ARRAY_FIXED() {
        return arrayFixed;
    }

    static get ARRAY_VARIABLE() {
        return arrayVariable;
    }

    static get SIMPLE() {
        return simple;
    }

    static get TABLE_FIXED() {
        return tableFixed;
    }

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
