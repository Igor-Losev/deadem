import Assert from '#core/Assert.js';

import Field from './Field.js';
import FieldPathBuilder from './path/FieldPathBuilder.js';
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
        this._storageCache = [];
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
     * Resolves the decoder function for a cached field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {FieldDecoder}
     */
    getDecoderForFieldPathId(fieldPathId) {
        const cached = this._decoderCache[fieldPathId] ?? null;

        if (cached !== null) {
            return cached;
        }

        return this.getDecoderForFieldPath(FieldPathBuilder.getById(fieldPathId));
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
     * Resolves the flattened field name for a cached field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {string}
     */
    getNameForFieldPathId(fieldPathId) {
        const cached = this._nameCache[fieldPathId] ?? null;

        if (cached !== null) {
            return cached;
        }

        return this.getNameForFieldPath(FieldPathBuilder.getById(fieldPathId));
    }

    /**
     * Resolves the storage descriptor for a given field path.
     *
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._storageCache[fieldPath.id] ?? null;

            if (cached !== null) {
                return cached;
            }
        }

        const field = this._fields[fieldPath.get(fieldPathIndex)];
        const storage = field.getStorageForFieldPath(fieldPath, fieldPathIndex + 1);

        if (fieldPathIndex === 0) {
            this._storageCache[fieldPath.id] = storage;
        }

        return storage;
    }

    /**
     * Resolves the storage descriptor for a cached field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPathId(fieldPathId) {
        const cached = this._storageCache[fieldPathId] ?? null;

        if (cached !== null) {
            return cached;
        }

        return this.getStorageForFieldPath(FieldPathBuilder.getById(fieldPathId));
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
