import Assert from './../../core/Assert.js';

import Field from './Field.js';
import SerializerKey from './SerializerKey.js';

class Serializer {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {number} version
     * @param {Array<Field>} fields
     */
    constructor(name, version, fields) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Number.isInteger(version));
        Assert.isTrue(Array.isArray(fields) && fields.every(f => f instanceof Field));

        this._key = new SerializerKey(name, version);
        this._fields = fields;
    }

    /**
     * @public
     * @returns {SerializerKey}
     */
    get key() {
        return this._key;
    }

    /**
     * @public
     * @returns {Array<Field>}
     */
    get fields() {
        return this._fields;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldDecoder}
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
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} fieldPathIndex
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, fieldPathIndex = 0) {
        return this._fields[fieldPath.get(fieldPathIndex)].getNameForFieldPath(fieldPath, fieldPathIndex + 1);
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

export default Serializer;
