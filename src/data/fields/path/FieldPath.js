'use strict';

const assert = require('node:assert/strict');

class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>} path
     * @param {number} length
     */
    constructor(path, length) {
        assert(Array.isArray(path));
        assert(Number.isInteger(length));

        this._path = path;
        this._length = length;
    }

    /**
     * @public
     * @returns {Array<Number>}
     */
    get path() {
        return this._path;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._length;
    }

    /**
     * @public
     * @param {number} index
     * @returns {number}
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
        return this._path.join('|');
    }
}

module.exports = FieldPath;
