'use strict';

const assert = require('node:assert/strict');

const Class = require('./Class');

class Entity {
    constructor(index, serial, clazz) {
        assert(Number.isInteger(index));
        assert(Number.isInteger(serial));
        assert(clazz instanceof Class);

        this._index = index;
        this._serial = serial;
        this._class = clazz;
    }

    /**
     * @returns {Number}
     */
    get index() {
        return this._index;
    }

    /**
     * @returns {Number}
     */
    get serial() {
        return this._serial;
    }

    /**
     * @returns {Class}
     */
    get class() {
        return this._class;
    }
}

module.exports = Entity;
