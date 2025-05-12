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

    /**
     * @returns {Number}
     */
    get length() {
        return this._length;
    }

    /**
     * @public
     * @param {Number} index
     * @returns {Number}
     */
    get(index) {
        if (index >= this._length) {
            throw new Error(`Unable to get path - index [ ${index} ] is out of bounds [ ${this._length} ]`);
        }

        return this._path[index];
    }

    /**
     * @public
     * @returns {string}
     */
    toString() {
        return this._path.slice(0, this._length).join('|');
    }
}

module.exports = FieldPath;
