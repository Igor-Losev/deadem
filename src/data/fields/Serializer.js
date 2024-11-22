'use strict';

const assert = require('node:assert/strict');

const Field = require('./Field'),
    FieldPath = require('./path/FieldPath');

const SerializerKey = require('./SerializerKey');

class Serializer {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Number} version
     * @param {Array<Field>} fields
     */
    constructor(name, version, fields) {
        assert(typeof name === 'string');
        assert(Number.isInteger(version));
        assert(Array.isArray(fields) && fields.every(f => f instanceof Field));

        this._key = new SerializerKey(name, version);
        this._fields = fields;
    }

    get key() {
        return this._key;
    }

    get fields() {
        return this._fields;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {Number=} fieldPathIndex
     */
    getDecoder(fieldPath, fieldPathIndex = 0) {
        assert(fieldPath instanceof FieldPath);
        assert(Number.isInteger(fieldPathIndex));

        const fieldIndex = fieldPath.get(fieldPathIndex);

        if (!Number.isInteger(fieldIndex) || fieldIndex >= this._fields.length) {
            throw new Error(`Unable to get decoder - field index [ ${fieldIndex} ] is out of bounds`);
        }

        const field = this._fields[fieldIndex];

        return field.getDecoder(fieldPath, fieldPathIndex + 1);
    }
}

module.exports = Serializer;
