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

    get index() {
        return this._index;
    }

    get serial() {
        return this._serial;
    }

    get class() {
        return this._class;
    }
}

module.exports = Entity;
