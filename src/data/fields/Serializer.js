'use strict';

const assert = require('node:assert/strict');

const Field = require('./Field');

class Serializer {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Number} version
     * @param {Field} fields
     */
    constructor(name, version, fields) {
        assert(typeof name === 'string');
        assert(Number.isInteger(version));
        assert(Array.isArray(fields) && fields.every(f => f instanceof Field));

        this._name = name;
        this._version = version;
        this._fields = fields;
    }

    get name() {
        return this._name;
    }

    get version() {
        return this._version;
    }

    get fields() {
        return this._fields;
    }
}

module.exports = Serializer;
