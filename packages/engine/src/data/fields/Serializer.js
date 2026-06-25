import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from './Field.js';
import FieldAccessor from './FieldAccessor.js';
import FieldPathBuilder from './path/FieldPathBuilder.js';
import SerializerKey from './SerializerKey.js';

const ELEMENT_INDEX_LENGTH = 4;

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
        this._definitionCache = [];
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
     * Returns `true` when [segment] is an element index (e.g. `'0000'`).
     *
     * @public
     * @static
     * @param {string} segment
     * @returns {boolean}
     */
    static getIsElementIndex(segment) {
        return segment.length >= ELEMENT_INDEX_LENGTH && /^\d+$/.test(segment);
    }

    /**
     * Formats a field name with an element index.
     *
     * Serializer.formatElementIndex('m_vecAbilities', 0) -> 'm_vecAbilities.0000'
     *
     * @public
     * @static
     * @param {string} fieldName
     * @param {number} index
     * @returns {string}
     */
    static formatElementIndex(fieldName, index) {
        return `${fieldName}.${String(index).padStart(ELEMENT_INDEX_LENGTH, '0')}`;
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
     * Resolves the field definition for a given field path.
     *
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldDefinition}
     */
    getDefinitionForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._definitionCache[fieldPath.id] ?? null;

            if (cached !== null) {
                return cached;
            }
        }

        const field = this._fields[fieldPath.get(fieldPathIndex)];
        const definition = field.getDefinitionForFieldPath(fieldPath, fieldPathIndex + 1);

        if (fieldPathIndex === 0) {
            this._definitionCache[fieldPath.id] = definition;
        }

        return definition;
    }

    /**
     * Resolves the field definition for a cached field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {FieldDefinition}
     */
    getDefinitionForFieldPathId(fieldPathId) {
        const cached = this._definitionCache[fieldPathId] ?? null;

        if (cached !== null) {
            return cached;
        }

        return this.getDefinitionForFieldPath(FieldPathBuilder.getById(fieldPathId));
    }

    /**
     * Resolves a flattened name to a {@link FieldAccessor}. Walks the schema
     * segment by segment, independently of entity state. Returns `null` when
     * the name does not resolve.
     *
     *     'm_flHealth'                 // scalar
     *     'm_vecAbilities'             // full array
     *     'm_vecAbilities.0000'        // array element
     *     'CBodyComponent.m_vecX'      // drill into fixed table
     *     'm_vecState.0000.m_bits'     // drill into struct element
     *
     * @public
     * @param {string} name
     * @returns {FieldAccessor|null}
     */
    getFieldAccessorForName(name) {
        const segments = name.split('.');

        const path = [ ];

        let serializer = this;
        let field = null;
        let i = 0;

        while (i < segments.length) {
            const index = serializer.getFieldIndexForName(segments[i]);

            if (index === null) {
                return null;
            }

            field = serializer.fields[index];

            path.push(index);
            i++;

            if (i === segments.length) {
                return new FieldAccessor(field, FieldPathBuilder.build(path));
            }

            switch (field.model) {
                case FieldModel.ARRAY_VARIABLE:
                case FieldModel.ARRAY_FIXED: {
                    if (!Serializer.getIsElementIndex(segments[i])) {
                        return null;
                    }

                    const elementIndex = parseInt(segments[i], 10);
                    i++;

                    if (segments.length !== i) {
                        return null;
                    }

                    return new FieldAccessor(field, FieldPathBuilder.build(path), elementIndex);
                }
                case FieldModel.TABLE_VARIABLE: {
                    if (!Serializer.getIsElementIndex(segments[i])) {
                        return null;
                    }

                    const elementIndex = parseInt(segments[i], 10);
                    i++;

                    if (i === segments.length) {
                        return new FieldAccessor(field, FieldPathBuilder.build(path), elementIndex);
                    }

                    path.push(elementIndex);

                    serializer = field.serializer;

                    break;
                }
                case FieldModel.TABLE_FIXED: {
                    serializer = field.serializer;

                    break;
                }
                default:
                    return null;
            }
        }

        return null;
    }

    /**
     * Resolves a field's index in this serializer by its name.
     *
     * @public
     * @param {string} name
     * @returns {number|null}
     */
    getFieldIndexForName(name) {
        const i = this._fields.findIndex(f => f.name === name);

        // IL 2026-06-25: a leaf name can repeat in one serializer when the same
        // field is reached through different send nodes. To avoid silently
        // returning data from the wrong duplicate, ambiguous names resolve to
        // null. This is a safety measure — a proper disambiguation (e.g.
        // sendNode-prefixed names) should be revisited in the future.
        if (i === -1 || this._fields.findIndex((f, j) => j > i && f.name === name) !== -1) {
            return null;
        }

        return i;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {boolean}
     */
    getIsContainerForFieldPath(fieldPath, index) {
        return this._fields[fieldPath.get(index)].getIsContainerForFieldPath(fieldPath, index + 1);
    }

    /**
     * @public
     * @param {number} fieldPathId
     * @returns {boolean}
     */
    getIsContainerForFieldPathId(fieldPathId) {
        const fieldPath = FieldPathBuilder.getById(fieldPathId);

        const field = this._fields[fieldPath.get(0)];

        return field.getIsContainerForFieldPath(fieldPath, 1);
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
     * Unpacks a struct (an object keyed by field name) for the element the
     * [extractor] currently points to. Returns `undefined` when no field is
     * present.
     *
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Object|undefined}
     */
    unpack(extractor) {
        let out = null;

        for (let i = 0; i < this._fields.length; i++) {
            extractor.enter(i);

            const value = this._fields[i].unpack(extractor);

            extractor.exit();

            if (value !== undefined) {
                if (out === null) {
                    out = { };
                }

                out[this._fields[i].name] = value;
            }
        }

        return out ?? undefined;
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
