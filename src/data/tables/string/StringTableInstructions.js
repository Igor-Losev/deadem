import Assert from './../../../core/Assert.js';

class StringTableInstructions {
    /**
     * @public
     * @param {number} userDataSizeBits
     * @param {boolean} userDataFixedSize
     * @param {boolean} usingVarintBitcounts
     */
    constructor(userDataSizeBits, userDataFixedSize, usingVarintBitcounts) {
        Assert.isTrue(Number.isInteger(userDataSizeBits))
        Assert.isTrue(typeof userDataFixedSize === 'boolean')
        Assert.isTrue(typeof  usingVarintBitcounts === 'boolean')

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

export default StringTableInstructions;
