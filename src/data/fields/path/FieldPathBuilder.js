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
     * @param {number} value
     * @param {number=} index
     */
    add(value, index = this._pointer) {
        if (this._length === 0) {
            throw new Error(`Unable to add value [ ${value} ] - path is empty`);
        }

        if (index >= this._length) {
            throw new Error(`Unable to add value [ ${value} ] - index [ ${index} ] is bigger than path length [ ${this._length} ]`);
        }

        this._path[index] += value;
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
     * @param {number} count
     */
    drop(count) {
        if (count > this._length) {
            throw new Error(`Unable to drop [ ${count} ] items - path has only [ ${this._length} ] items`);
        }

        for (let i = 0; i < count; i++) {
            this._path[this._pointer] = 0;

            this._length -= 1;
            this._pointer -= 1;
        }
    }

    /**
     * @public
     * @param {number} value
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
     * @param {number} value
     */
    set(value) {
        this._path[this._pointer] = value;
    }
}

module.exports = FieldPathBuilder;
