import Assert from '#core/Assert.js';

import Class from '#data/Class.js';

import FieldStorageType from '#data/enums/FieldStorageType.js';

const INITIAL_TYPED_ARRAY_SIZE = 8;

class Entity {
    /**
     * @constructor
     * @param {number} index
     * @param {number} serial
     * @param {Class} clazz
     */
    constructor(index, serial, clazz) {
        Assert.isTrue(Number.isInteger(index));
        Assert.isTrue(Number.isInteger(serial));
        Assert.isTrue(clazz instanceof Class);

        this._index = index;
        this._serial = serial;
        this._class = clazz;

        this._handle = ((serial << 14) | index) >>> 0;

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
     */
    deactivate() {
        this._active = false;
    }

    /**
     * Number of field paths currently set on the entity.
     *
     * @public
     * @returns {number}
     */
    getStateSize() {
        const metas = this._class.layout.getMetas();

        let size = 0;

        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];

            if (meta.storage !== FieldStorageType.MISC && this._getIsPresent(meta)) {
                size++;
            }
        }

        if (this._state.misc !== null) {
            size += this._state.misc.size;
        }

        return size;
    }

    /**
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

                if (this._getIsPresent(meta)) {
                    unpacked[serializer.getNameForFieldPathId(meta.id)] = this._read(meta);
                }
            }

            this._snapshot = unpacked;
            this._changed = new Set();

            return unpacked;
        }

        const unpacked = this._snapshot;

        this._changed.forEach((id) => {
            unpacked[serializer.getNameForFieldPathId(id)] = this._read(layout.resolve(id));
        });

        this._changed.clear();

        return unpacked;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    updateByFieldPath(fieldPath, value) {
        this.updateByFieldPathId(fieldPath.id, value);
    }

    /**
     * @public
     * @param {number} fieldPathId
     * @param {*} value
     */
    updateByFieldPathId(fieldPathId, value) {
        const meta = this._class.layout.resolve(fieldPathId);

        if (meta.storage === FieldStorageType.FLOAT) {
            const offset = meta.offset;

            if (offset >= this._state.float32.length) {
                this._state.float32 = grow(this._state.float32, Float32Array, offset + 1);
            }

            this._state.float32[offset] = value;

            this._markPresence(meta.present);
        } else if (meta.storage === FieldStorageType.INT) {
            const offset = meta.offset;

            if (offset >= this._state.int32.length) {
                this._state.int32 = grow(this._state.int32, Int32Array, offset + 1);
            }

            this._state.int32[offset] = value;

            this._markPresence(meta.present);
        } else if (meta.storage === FieldStorageType.VECTOR) {
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
    _getIsPresent(meta) {
        if (meta.storage === FieldStorageType.MISC) {
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
        if (meta.storage === FieldStorageType.FLOAT) {
            return this._state.float32[meta.offset];
        }

        if (meta.storage === FieldStorageType.INT) {
            const value = this._state.int32[meta.offset];

            if (meta.bool) {
                return value !== 0;
            }

            return meta.signed ? value : value >>> 0;
        }

        if (meta.storage === FieldStorageType.VECTOR) {
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
