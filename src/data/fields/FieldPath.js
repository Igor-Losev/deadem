'use strict';

const MAX_LENGTH = 7;

class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>=} path
     * @param {Number=} length
     */
    constructor(path, length) {
        if (Array.isArray(path)) {
            this._path = path;
        } else {
            this._path = getDefaultPath();
        }

        if (Number.isInteger(length)) {
            this._length = length;
        } else {
            this._length = getDefaultLength();
        }
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

function getDefaultPath() {
    const path = new Array(MAX_LENGTH).fill(0);

    path[0] = -1;

    return path;
}

function getDefaultLength() {
    return 1;
}

module.exports = FieldPath;
