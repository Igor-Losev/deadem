'use strict';

const assert = require('assert/strict');

class StringTableInstructions {
    /**
     * @public
     * @param {Number} userDataSizeBits
     * @param {boolean} userDataFixedSize
     * @param {boolean} usingVarintBitcounts
     */
    constructor(userDataSizeBits, userDataFixedSize, usingVarintBitcounts) {
        assert(Number.isInteger(userDataSizeBits));
        assert(typeof userDataFixedSize === 'boolean');
        assert(typeof  usingVarintBitcounts === 'boolean');

        this._userDataSizeBits = userDataSizeBits;
        this._userDataFixedSize = userDataFixedSize;
        this._usingVarintBitcounts = usingVarintBitcounts;
    }

    get userDataFixedSize() {
        return this._userDataFixedSize;
    }

    get userDataSizeBits() {
        return this._userDataSizeBits;
    }

    get usingVarintBitcounts() {
        return this._usingVarintBitcounts;
    }
}

module.exports = StringTableInstructions;
