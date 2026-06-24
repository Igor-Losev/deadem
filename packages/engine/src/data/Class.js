import Assert from '#core/Assert.js';

import Serializer from './fields/Serializer.js';

import EntityStateLayout from './entity/EntityStateLayout.js';

class Class {
    /**
     * @constructor
     * @param {number} id
     * @param {String} name
     * @param {Serializer} serializer
     */
    constructor(id, name, serializer) {
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(serializer instanceof Serializer);

        this._id = id;
        this._name = name;
        this._serializer = serializer;

        this._accessors = new Map();
        this._layout = new EntityStateLayout(serializer);
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {String}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Serializer}
     */
    get serializer() {
        return this._serializer;
    }

    /**
     * Per-class typed-array storage plan for entity state.
     *
     * @public
     * @returns {EntityStateLayout}
     */
    get layout() {
        return this._layout;
    }

    /**
     * Returns the compiled read accessor for a flattened field name, or `null`
     * when the name does not resolve. Compiled once per name and cached.
     *
     * @public
     * @param {string} name
     * @returns {FieldAccessor|null}
     */
    getFieldAccessor(name) {
        if (this._accessors.has(name)) {
            return this._accessors.get(name);
        }

        const accessor = this._serializer.getFieldAccessorForName(name);

        this._accessors.set(name, accessor);

        return accessor;
    }
}

export default Class;
