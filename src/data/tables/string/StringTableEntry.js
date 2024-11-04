'use strict';

class StringTableEntry {
    /**
     * @public
     * @constructor
     *
     * @param {Number} id
     * @param {String} key
     * @param {Buffer|null|*} value
     */
    constructor(id, key, value) {
        this._id = id;
        this._key = key;
        this._value = value;
    }

    get id() {
        return this._id;
    }

    get key() {
        return this._key;
    }

    get value() {
        return this._value;
    }
}

module.exports = StringTableEntry;
