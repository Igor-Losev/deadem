import Assert from '#core/Assert.js';

import Class from '#data/Class.js';

import FieldStorageType from '#data/enums/FieldStorageType.js';

const STORAGE_FLOAT = FieldStorageType.FLOAT;
const STORAGE_INT = FieldStorageType.INT;
const STORAGE_VECTOR = FieldStorageType.VECTOR;
const STORAGE_MISC = FieldStorageType.MISC;

const INITIAL_TYPED_ARRAY_SIZE = 8;

const ENTITY_INDEX_BITS = 14;
const ENTITY_INDEX_MAX = 1 << ENTITY_INDEX_BITS;

class Entity {
    /**
     * @constructor
     * @param {number} index
     * @param {number} serial
     * @param {Class} clazz
     */
    constructor(index, serial, clazz) {
        Assert.isTrue(Number.isInteger(index) && index >= 0 && index < ENTITY_INDEX_MAX, 'entity index out of range');
        Assert.isTrue(Number.isInteger(serial));
        Assert.isTrue(clazz instanceof Class);

        this._index = index;
        this._serial = serial;
        this._class = clazz;

        this._handle = ((serial << ENTITY_INDEX_BITS) | index) >>> 0;

        this._active = true;

        this._state = {
            float32: new Float32Array(clazz.layout.getFloatLength()),
            int32: new Int32Array(clazz.layout.getIntLength()),
            misc: null,
            presence: new Uint8Array(clazz.layout.getPresenceLength())
        };

        this._changed = null;
        this._snapshot = null;
    }

    /**
     * @public
     * @returns {number}
     */
    get index() {
        return this._index;
    }

    /**
     * @public
     * @returns {number}
     */
    get serial() {
        return this._serial;
    }

    /**
     * @public
     * @returns {Class}
     */
    get class() {
        return this._class;
    }

    /**
     * Unique identifier (handle) for an entity in the game world.
     *
     * The handle encodes two components:
     *  - index: the index of the entity in the entity list.
     *  - serial: a generation counter used to distinguish between recycled entity indices.
     *
     * @public
     * @returns {number}
     */
    get handle() {
        return this._handle;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get active() {
        return this._active;
    }

    /**
     * @public
     */
    activate() {
        this._active = true;
    }

    /**
     * @public
     * @param {EntityMutationBatch} batch
     */
    applyFromBatch(batch) {
        for (let i = 0; i < batch.ids.length; i++) {
            this.updateByFieldPathId(batch.ids[i], batch.values[i]);
        }
    }

    /**
     * @public
     * @param {EntityMutationExtractor} extractor
     */
    applyFromExtractor(extractor) {
        extractor.forEach((id, value) => this.updateByFieldPathId(id, value));
    }

    /**
     * @public
     */
    deactivate() {
        this._active = false;
    }

    /**
     * Reads a field by its flattened name. Returns a scalar, a fully
     * reconstructed array, or a plain object for a struct. Nested names
     * like `'m_vecImbuements.0000.m_vecImbuedAbilities'` drill in. Returns
     * `undefined` when the name does not resolve.
     *
     *     'm_flHealth'
     *     'm_vecAbilities'           // full array
     *     'm_vecAbilities.0000'      // single element
     *     'CBodyComponent.m_vecX'    // drill into fixed table
     *     'm_vecState.0000.m_bits'   // drill into struct element
     *
     * Arrays are not guaranteed to be contiguous — indices with no data
     * appear as `undefined` in the reconstructed array. For example,
     * `[100, undefined, 300]` is a valid result when only elements 0 and
     * 2 are present.
     *
     * Resolution is cached per class — the name walk happens once. The
     * remaining cost depends on how many elements are read. Rough numbers
     * from a 556 MB Deadlock replay:
     *
     *     'm_iHealth'                 | scalar .......... ~0.08 µs
     *     'm_iszPlayerName'           | string .......... ~0.07 µs
     *     'CBodyComponent.m_vecX'     | nested .......... ~0.09 µs
     *     'm_vecAbilities.0000'       | indexed ......... ~0.11 µs
     *     'm_vecAbilities'            | 16 × scalar ..... ~0.96 µs
     *     'm_vecFOWEntities.0000'     | 8  × scalar ..... ~0.71 µs
     *     'm_vecFOWEntities'          | 121 × 8 fields .. ~88   µs
     *
     * A full array read unpacks every element — N leaf reads. For a large
     * nested structure like `'m_vecFOWEntities'` (121 elements × 8 fields),
     * that is 968 leaf reads and ~88 µs. Calling this every tick adds up.
     * Throttle such calls.
     *
     * @public
     * @param {string} name
     * @returns {*}
     */
    getField(name) {
        const accessor = this._class.getFieldAccessor(name);

        if (accessor === null) {
            return undefined;
        }

        const readField = fieldPath => this.getFieldById(fieldPath.id);

        return accessor.read(readField);
    }

    /**
     * Reads a single field by its field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {*}
     */
    getFieldById(fieldPathId) {
        const meta = this._class.layout.peek(fieldPathId);

        if (meta === null || !this._getIsPresent(meta)) {
            return undefined;
        }

        return this._read(meta);
    }

    /**
     * Number of field paths currently set on the entity.
     *
     * @public
     * @returns {number}
     */
    getFieldCount() {
        const metas = this._class.layout.getMetas();

        let size = 0;

        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];

            if (!this._getIsContainer(meta) && meta.storage !== STORAGE_MISC && this._getIsPresent(meta)) {
                size++;
            }
        }

        if (this._state.misc !== null) {
            size += this._state.misc.size;
        }

        return size;
    }

    /**
     * Iterates `[ name, value ]` pairs for all fields currently present.
     *
     * @public
     * @returns {IterableIterator<[ string, * ]>}
     */
    * fieldEntries() {
        const metas = this._class.layout.getMetas();
        const serializer = this._class.serializer;

        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];

            if (!this._getIsContainer(meta) && this._getIsPresent(meta)) {
                yield [ serializer.getNameForFieldPathId(meta.id), this._read(meta) ];
            }
        }
    }

    /**
     * Iterates the flattened names of all fields currently present.
     *
     * @public
     * @returns {IterableIterator<string>}
     */
    * fieldNames() {
        const metas = this._class.layout.getMetas();
        const serializer = this._class.serializer;

        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];

            if (!this._getIsContainer(meta) && this._getIsPresent(meta)) {
                yield serializer.getNameForFieldPathId(meta.id);
            }
        }
    }

    /**
     * Returns whether [name] resolves to a value currently present on this
     * entity.
     *
     * Must be revisited. Reconstructs the value just to test presence.
     *
     * @public
     * @param {string} name
     * @returns {boolean}
     */
    hasField(name) {
        return this.getField(name) !== undefined;
    }

    /**
     * Returns a snapshot of all present fields as a plain object. The first
     * call reads every field and caches the result. Subsequent calls patch
     * only changed fields into the cached object.
     *
     * Use {@link #getField} unless you are debugging.
     *
     * @public
     * @returns {*}
     */
    unpackFlattened() {
        const layout = this._class.layout;
        const serializer = this._class.serializer;

        const metas = this._class.layout.getMetas();

        if (this._snapshot === null) {
            const unpacked = { };

            for (let i = 0; i < metas.length; i++) {
                const meta = metas[i];

                if (!this._getIsContainer(meta) && this._getIsPresent(meta)) {
                    unpacked[serializer.getNameForFieldPathId(meta.id)] = this._read(meta);
                }
            }

            this._snapshot = unpacked;
            this._changed = new Set();

            return unpacked;
        }

        const unpacked = this._snapshot;

        this._changed.forEach((id) => {
            const meta = layout.peekOrAssign(id);

            if (!this._getIsContainer(meta)) {
                unpacked[serializer.getNameForFieldPathId(id)] = this._read(meta);
            }
        });

        this._changed.clear();

        return unpacked;
    }

    /**
     * @internal
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    updateByFieldPath(fieldPath, value) {
        this.updateByFieldPathId(fieldPath.id, value);
    }

    /**
     * @internal
     * @public
     * @param {number} fieldPathId
     * @param {*} value
     */
    updateByFieldPathId(fieldPathId, value) {
        const meta = this._class.layout.peekOrAssign(fieldPathId);

        if (meta.storage === STORAGE_FLOAT) {
            const offset = meta.offset;

            if (offset >= this._state.float32.length) {
                this._state.float32 = grow(this._state.float32, Float32Array, offset + 1);
            }

            this._state.float32[offset] = value;

            this._markPresence(meta.present);
        } else if (meta.storage === STORAGE_INT) {
            const offset = meta.offset;

            if (offset >= this._state.int32.length) {
                this._state.int32 = grow(this._state.int32, Int32Array, offset + 1);
            }

            this._state.int32[offset] = value;

            this._markPresence(meta.present);
        } else if (meta.storage === STORAGE_VECTOR) {
            const offset = meta.offset;
            const end = offset + meta.dim;

            if (end > this._state.float32.length) {
                this._state.float32 = grow(this._state.float32, Float32Array, end);
            }

            for (let i = 0; i < meta.dim; i++) {
                this._state.float32[offset + i] = value[i];
            }

            this._markPresence(meta.present);
        } else {
            if (this._state.misc === null) {
                this._state.misc = new Map();
            }

            this._state.misc.set(fieldPathId, value);
        }

        if (this._changed !== null) {
            this._changed.add(fieldPathId);
        }
    }

    /**
     * @protected
     * @param {Object} meta
     * @returns {boolean}
     */
    _getIsContainer(meta) {
        return meta.container;
    }

    /**
     * @protected
     * @param {Object} meta
     * @returns {boolean}
     */
    _getIsPresent(meta) {
        if (meta.storage === STORAGE_MISC) {
            return this._state.misc !== null && this._state.misc.has(meta.id);
        }

        return meta.present < this._state.presence.length && this._state.presence[meta.present] === 1;
    }

    /**
     * @protected
     * @param {number} present
     */
    _markPresence(present) {
        if (present >= this._state.presence.length) {
            this._state.presence = grow(this._state.presence, Uint8Array, present + 1);
        }

        this._state.presence[present] = 1;
    }

    /**
     * @protected
     * @param {Object} meta
     * @returns {*}
     */
    _read(meta) {
        if (meta.storage === STORAGE_FLOAT) {
            return this._state.float32[meta.offset];
        }

        if (meta.storage === STORAGE_INT) {
            const value = this._state.int32[meta.offset];

            if (meta.bool) {
                return value !== 0;
            }

            return meta.signed ? value : value >>> 0;
        }

        if (meta.storage === STORAGE_VECTOR) {
            const vector = new Float32Array(meta.dim);

            for (let i = 0; i < meta.dim; i++) {
                vector[i] = this._state.float32[meta.offset + i];
            }

            return vector;
        }

        return this._state.misc.get(meta.id);
    }
}

/**
 * @param {Float32Array|Int32Array|Uint8Array} current
 * @param {Function} Ctor
 * @param {number} min
 * @returns {Float32Array|Int32Array|Uint8Array}
 */
function grow(current, Ctor, min) {
    let length = current.length === 0 ? INITIAL_TYPED_ARRAY_SIZE : current.length;

    while (length < min) {
        length *= 2;
    }

    const next = new Ctor(length);

    next.set(current);

    return next;
}

export default Entity;
