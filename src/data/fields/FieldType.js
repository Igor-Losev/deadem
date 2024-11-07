'use strict';

const assert = require('node:assert/strict');

const REGEX = /([^<> ]+)/g;

class FieldType {
    constructor(parts) {
        assert(Array.isArray(parts) && parts.length > 0 && parts.every(p => typeof p === 'string' && p.length > 0));

        this._parts = parts;
    }

    get first() {
        return this._parts[0] || null;
    }

    get second() {
        return this._parts[1] || null;
    }

    get third() {
        return this._parts[2] || null;
    }

    get length() {
        return this._parts.length;
    }

    static parse(varType) {
        assert(typeof varType === 'string');

        let match = null;

        const parts = [ ];

        while ((match = REGEX.exec(varType)) !== null) {
            parts.push(match[0]);
        }

        return new FieldType(parts);
    }
}

module.exports = FieldType;
