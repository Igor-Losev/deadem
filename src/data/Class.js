import Assert from './../core/Assert.js';

import Serializer from './fields/Serializer.js';

class Class {
    constructor(id, name, serializer) {
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(serializer instanceof Serializer);

        this._id = id;
        this._name = name;
        this._serializer = serializer;
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
}

export default Class;
