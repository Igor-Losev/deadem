import Assert from '#core/Assert.js';

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

        this._decoderCache = [];
        this._nameCache = [];
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
     * Resolves the decoder function for a given field path.
     *
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldDecoder}
     */
    getDecoderForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._decoderCache[fieldPath.id] ?? null;

            if (cached !== null) {
                return cached;
            }
        }

        const field = this._fields[fieldPath.get(fieldPathIndex)];
        const decoder = field.getDecoderForFieldPath(fieldPath, fieldPathIndex + 1);

        if (fieldPathIndex === 0) {
            this._decoderCache[fieldPath.id] = decoder;
        }

        return decoder;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [fieldPathIndex=0]
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._nameCache[fieldPath.id] ?? null;

            if (cached !== null) {
                return cached;
            }

            const name = this._fields[fieldPath.get(0)].getNameForFieldPath(fieldPath, 1);

            this._nameCache[fieldPath.id] = name;

            return name;
        }

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
