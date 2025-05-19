'use strict';

const assert = require('node:assert/strict');

const Field = require('./Field');

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

    /**
     * @returns {SerializerKey}
     */
    get key() {
        return this._key;
    }

    /**
     * @returns {Array<Field>}
     */
    get fields() {
        return this._fields;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {Number=} fieldPathIndex
     */
    getDecoderForFieldPath(fieldPath, fieldPathIndex = 0) {
        const fieldIndex = fieldPath.get(fieldPathIndex);

        if (!Number.isInteger(fieldIndex) || fieldIndex >= this._fields.length) {
            throw new Error(`Unable to get decoder: field index [ ${fieldIndex} ] is out of bounds(${this._fields.length})`);
        }

        const field = this._fields[fieldIndex];

        return field.getDecoderForFieldPath(fieldPath, fieldPathIndex + 1);
    }

    /**
     * Pushes a {@link Field}.
     *
     * @public
     * @param {Field} field
     */
    push(field) {
        this._fields.push(field);
    }
}

module.exports = Serializer;
