/** @import FieldTableFixed from './models/FieldTableFixed.js' */
/** @import FieldTableVariable from './models/FieldTableVariable.js' */
/** @import { FieldDecoderFn } from './decoding/FieldDecoder.js' */
/** @import FieldStorageDescriptor from './decoding/FieldStorageDescriptor.js' */
/** @import FieldPath from './path/FieldPath.js' */

/** @import FieldDefinition from './FieldDefinition.js' */
/** @import FieldExtractor from './FieldExtractor.js' */

import Assert from '../../core/Assert.js';

import FieldModel from '../enums/FieldModel.js';

import Field from './Field.js';
import FieldAccessor from './FieldAccessor.js';
import FieldPathBuilder from './path/FieldPathBuilder.js';
import SerializerKey from './SerializerKey.js';

const ELEMENT_INDEX_LENGTH = 4;

class Serializer {
    /**
     * @public
     * @constructor
     * @param {string} name
     * @param {number} version
     * @param {Array<Field>} fields
     */
    constructor(name, version, fields) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Number.isInteger(version));
        Assert.isTrue(Array.isArray(fields) && fields.every(f => f instanceof Field));

        /** @private */
        this._key = new SerializerKey(name, version);
        /** @private */
        this._fields = fields;

        /** @private @type {Array<FieldDecoderFn|null>} */
        this._decoderCache = [];
        /** @private @type {Array<*>} */
        this._definitionCache = [];
        /** @private @type {Array<*>} */
        this._nameCache = [];
        /** @private @type {Array<*>} */
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
     * Returns `true` when the segment is an element index (e.g. `'0000'`).
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
        return Field.joinName([ fieldName, String(index).padStart(ELEMENT_INDEX_LENGTH, '0') ]);
    }

    /**
     * Resolves the decoder function for a given field path.
     *
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldDecoderFn}
     */
    getDecoderForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._decoderCache[fieldPath.id];

            if (cached !== undefined && cached !== null) {
                return cached;
            }
        }

        const field = this._fields[fieldPath.get(fieldPathIndex)];
        const decoder = field.getDecoderForFieldPath(fieldPath, fieldPathIndex + 1);

        if (fieldPathIndex === 0) {
            const cache = this._decoderCache;

            for (let i = cache.length; i <= fieldPath.id; i++) {
                cache.push(null);
            }

            cache[fieldPath.id] = decoder;
        }

        return decoder;
    }

    /**
     * Resolves the decoder function for a cached field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {FieldDecoderFn}
     */
    getDecoderForFieldPathId(fieldPathId) {
        const cached = this._decoderCache[fieldPathId];

        if (cached !== undefined && cached !== null) {
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
     * segment by segment. Returns `null` when the name does not resolve.
     *
     *     'm_flHealth'                                            // scalar
     *     'm_vecAbilities'                                        // full array
     *     'm_vecAbilities.0000'                                   // array element
     *     'CBodyComponent.m_skeletonInstance.m_vecOrigin.m_vecX'  // drill into fixed table
     *     'm_vecState.0000.m_bits'                                // drill into struct element
     *
     * @public
     * @param {string} name
     * @returns {FieldAccessor|null}
     */
    getFieldAccessorForName(name) {
        const path = [ ];

        /** @type {Serializer} */
        let serializer = this;
        let segments = Field.splitName(name);

        while (segments.length > 0) {
            const index = serializer.getFieldIndexForSegments(segments);

            if (index === null) {
                return null;
            }

            const field = serializer.fields[index];

            path.push(index);

            segments = segments.slice(field.segments.length);

            if (segments.length === 0) {
                return new FieldAccessor(field, FieldPathBuilder.build(path));
            }

            switch (field.model) {
                case FieldModel.ARRAY_VARIABLE:
                case FieldModel.ARRAY_FIXED: {
                    if (segments.length !== 1 || !Serializer.getIsElementIndex(segments[0])) {
                        return null;
                    }

                    return new FieldAccessor(field, FieldPathBuilder.build(path), parseInt(segments[0], 10));
                }
                case FieldModel.TABLE_VARIABLE: {
                    if (!Serializer.getIsElementIndex(segments[0])) {
                        return null;
                    }

                    const elementIndex = parseInt(segments[0], 10);

                    segments = segments.slice(1);

                    if (segments.length === 0) {
                        return new FieldAccessor(field, FieldPathBuilder.build(path), elementIndex);
                    }

                    path.push(elementIndex);

                    serializer = /** @type {FieldTableVariable} */ (field).serializer;

                    break;
                }
                case FieldModel.TABLE_FIXED: {
                    serializer = /** @type {FieldTableFixed} */ (field).serializer;

                    break;
                }
                default:
                    return null;
            }
        }

        return null;
    }

    /**
     * Returns the index of the field that `segments` start with.
     * Returns `null` otherwise.
     *
     * @public
     * @param {Array<string>} segments
     * @returns {number|null}
     */
    getFieldIndexForSegments(segments) {
        for (let i = 0; i < this._fields.length; i++) {
            if (this._fields[i].getIsPrefixOf(segments)) {
                return i;
            }
        }

        return null;
    }

    /**
     * Finds the closest variable array or table that the field path is an element of.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {{ collection: number, index: number }|null} The length field path id of the collection and the element index, or null.
     */
    getCollectionElementForFieldPathId(fieldPathId) {
        const path = FieldPathBuilder.getById(fieldPathId).path;

        /** @type {Serializer} */
        let serializer = this;
        /** @type {{ collection: number, index: number }|null} */
        let element = null;

        for (let i = 0; i < path.length - 1; i++) {
            const field = serializer._fields[path[i]];

            switch (field.model) {
                case FieldModel.ARRAY_VARIABLE:
                    return { collection: FieldPathBuilder.build(path.slice(0, i + 1)).id, index: path[i + 1] };
                case FieldModel.TABLE_VARIABLE: {
                    element = { collection: FieldPathBuilder.build(path.slice(0, i + 1)).id, index: path[i + 1] };

                    serializer = /** @type {FieldTableVariable} */ (field).serializer;

                    i++;

                    break;
                }
                case FieldModel.TABLE_FIXED: {
                    serializer = /** @type {FieldTableFixed} */ (field).serializer;

                    break;
                }
                default:
                    return element;
            }
        }

        return element;
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
     * Unpacks a struct (an object keyed by field name) at the current position
     * of the extractor. Returns `undefined` when no field is present.
     *
     * @public
     * @param {FieldExtractor} extractor
     * @returns {Object|undefined}
     */
    unpack(extractor) {
        /** @type {Record<string, *>|null} */
        let out = null;

        for (let i = 0; i < this._fields.length; i++) {
            extractor.enter(i);

            const value = this._fields[i].unpack(extractor);

            extractor.exit();

            if (value !== undefined) {
                if (out === null) {
                    out = { };
                }

                const field = this._fields[i];

                let target = out;

                for (let j = 0; j < field.sendNode.length; j++) {
                    target = target[field.sendNode[j]] ??= { };
                }

                target[field.varName] = value;
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
