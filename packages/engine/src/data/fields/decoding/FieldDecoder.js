import Assert from '#core/Assert.js';

import FieldStorageDescriptor from './FieldStorageDescriptor.js';

class FieldDecoder {
    /**
     * @public
     * @constructor
     * @param {(bitBuffer: BitBuffer) => *} fn
     * @param {FieldStorageDescriptor} storage
     */
    constructor(fn, storage) {
        Assert.isTrue(typeof fn === 'function');
        Assert.isTrue(storage instanceof FieldStorageDescriptor);

        this._fn = fn;
        this._storage = storage;
    }

    /**
     * @public
     * @returns {(bitBuffer: BitBuffer) => *}
     */
    get fn() {
        return this._fn;
    }

    /**
     * @public
     * @returns {FieldStorageDescriptor}
     */
    get storage() {
        return this._storage;
    }
}

export default FieldDecoder;
