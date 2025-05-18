'use strict';

const assert = require('node:assert/strict');

const Class = require('./Class'),
    EntityState = require('./EntityState');

class Entity {
    constructor(index, serial, clazz) {
        assert(Number.isInteger(index));
        assert(Number.isInteger(serial));
        assert(clazz instanceof Class);

        this._index = index;
        this._serial = serial;
        this._class = clazz;

        this._state = new EntityState();
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

    /**
     * @returns {EntityState}
     */
    get state() {
        return this._state;
    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     */
    updateFromBitBuffer(bitBuffer) {
        this._state.updateFromBitBuffer(bitBuffer, this._class.serializer);
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    updateByFieldPath(fieldPath, value) {
        this._state.updateByFieldPath(fieldPath, value);
    }
}

module.exports = Entity;
