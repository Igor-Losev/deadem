'use strict';

const assert = require('node:assert/strict');

class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>} path
     * @param {Number} length
     */
    constructor(path, length) {
        assert(Array.isArray(path));
        assert(Number.isInteger(length));

        this._path = path;
        this._length = length;
    }

    get path() {
        return this._path;
    }

    get length() {
        return this._length;
    }
}

module.exports = FieldPath;
