'use strict';

const MAX_LENGTH = 7;

const FieldPath = require('./FieldPath');

class FieldPathBuilder {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._path = new Array(MAX_LENGTH).fill(0);
        this._path[0] = -1;

        this._length = 1;
        this._pointer = 0;
    }

    get length() {
        return this._length;
    }

    /**
     * @public
     * @param {Number} value
     * @param {Number=} index
     */
    add(value, index = this._pointer) {
        if (this._length === 0) {
            throw new Error(`Unable to add value [ ${value} ] - path is empty`);
        }

        if (index >= this._length) {
            throw new Error(`Unable to add value [ ${value} ] - index [ ${index} ] is bigger than path length [ ${this._length} ]`);
        }

        this._path[this._pointer] += value;
    }

    /**
     * @public
     * @returns {FieldPath}
     */
    build() {
        return new FieldPath(this._path.slice(), this._length);
    }

    /**
     * @public
     * @param {Number} count
     */
    drop(count) {
        if (count > this._length) {
            throw new Error(`Unable to drop [ ${count} ] items - path has only [ ${this._length} ] items`);
        }

        for (let i = 0; i < count; i++) {
            this._path[this._pointer - i] = 0;

            this._length -= 1;
            this._pointer -= 1;
        }
    }

    /**
     * @public
     * @param {Number} value
     */
    push(value) {
        if (this._length >= MAX_LENGTH) {
            throw new Error(`Unable to push value [ ${value} ] - path is full`);
        }

        this._length += 1;
        this._pointer += 1;

        this._path[this._pointer] = value;
    }

    /**
     * @public
     * @param {Number} value
     */
    set(value) {
        this._path[this._pointer] = value;
    }
}

module.exports = FieldPathBuilder;
