'use strict';

const assert = require('node:assert/strict');

class SerializerKey {
    constructor(name, version) {
        assert(typeof name === 'string');
        assert(Number.isInteger(version));

        this._name = name;
        this._version = version;
    }

    get name() {
        return this._name;
    }

    get version() {
        return this._version;
    }

    toString() {
        return `${this._name}|${this._version}`;
    }
}

module.exports = SerializerKey;
