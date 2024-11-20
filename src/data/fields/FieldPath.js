'use strict';

const MAX_LENGTH = 7;

class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>=} path
     * @param {Number=} length
     */
    constructor(path = new Array(MAX_LENGTH), length = 0) {
        this._path = path.fill(0, Math.max(0, length - 1), MAX_LENGTH);
        this._length = length;
    }

    static get MAX_LENGTH() {
        return MAX_LENGTH;
    }

    get path() {
        return this._path;
    }

    get length() {
        return this._length;
    }

    /**
     * @public
     * @returns {FieldPath}
     */
    clone() {
        return new FieldPath(this._path.slice(), this._length);
    }

    /**
     * @public
     * @param {Number} n
     */
    drop(n) {
        if (n > this._length) {
            throw new Error(`Unable to drop(${n}). FieldPath has only [ ${this._length} ] items`);
        }

        for (let i = 0; i < n; i++) {
            this._path[this._length - 1 - i] = 0;
            this._length -= 1;
        }
    }

    /**
     * @public
     * @returns {Number}
     */
    expand() {
        if (this._length === MAX_LENGTH) {
            throw new Error(`Unable to expand FieldPath. Maximum length of [ ${MAX_LENGTH} ] reached`);
        }

        this._length += 1;

        return this._length;
    }
}

module.exports = FieldPath;
