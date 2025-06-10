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

        this._active = true;

        this._names = new Map();
        this._state = new Map();

        this._changed = new Set();
        this._snapshot = null;
    }

    /**
     * @returns {number}
     */
    get index() {
        return this._index;
    }

    /**
     * @returns {number}
     */
    get serial() {
        return this._serial;
    }

    /**
     * @returns {Class}
     */
    get class() {
        return this._class;
    }

    /**
     * @returns {boolean}
     */
    get active() {
        return this._active;
    }

    /**
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
