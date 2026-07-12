/** @import BitBuffer from '#core/BitBuffer.js' */

import Assert from '#core/Assert.js';

import FieldStorageDescriptor from './FieldStorageDescriptor.js';

/**
 * Decode function reading one field value from the bit stream.
 *
 * @typedef {(bitBuffer: BitBuffer) => *} FieldDecoderFn
 */

class FieldDecoder {
    /**
     * @public
     * @constructor
     * @param {FieldDecoderFn} fn
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
     * @returns {FieldDecoderFn}
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
