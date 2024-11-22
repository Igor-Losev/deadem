'use strict';

const assert = require('node:assert/strict');

const Serializer = require('./fields/Serializer');

class Class {
    constructor(id, name, serializer) {
        assert(Number.isInteger(id));
        assert(typeof name === 'string' && name.length > 0);
        assert(serializer instanceof Serializer);

        this._id = id;
        this._name = name;
        this._serializer = serializer;
    }

    /**
     * @public
     * @returns {Number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {String}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Serializer}
     */
    get serializer() {
        return this._serializer;
    }
}

module.exports = Class;
