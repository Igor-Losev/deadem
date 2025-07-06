import Assert from '#core/Assert.js';

import Class from '#data/Class.js';

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

        this._names = new Map();
        this._state = new Map();

        this._changed = new Set();
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
     * @returns {Map<FieldPath, *>}
     */
    get state() {
        return this._state;
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
     * @public
     * @returns {*}
     */
    unpackFlattened() {
        const unpacked = this._snapshot || { };

        this._changed.forEach((fieldPath) => {
            const value = this._state.get(fieldPath);

            let name = this._names.get(fieldPath) || null;

            if (name === null) {
                name = this._class.serializer.getNameForFieldPath(fieldPath);

                this._names.set(fieldPath, name);
            }

            unpacked[name] = value;
        });

        this._snapshot = unpacked;
        this._changed.clear();

        return unpacked;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    updateByFieldPath(fieldPath, value) {
        this._state.set(fieldPath, value);
        this._changed.add(fieldPath);
    }
}

export default Entity;
