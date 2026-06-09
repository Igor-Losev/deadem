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
     * Resolves a flattened field name to its field path id for this class.
     *
     * @public
     * @param {string} name
     * @returns {number|null}
     */
    getFieldPathId(name) {
        return this._layout.getFieldPathId(name);
    }
}

export default Class;
