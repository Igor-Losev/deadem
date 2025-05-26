import Assert from './../../core/Assert.js';

class HuffmanTreePriority {
    /**
     * @public
     * @constructor
     * @param {number} weight
     * @param {number} sequence
     */
    constructor(weight, sequence) {
        Assert.isTrue(Number.isInteger(weight));
        Assert.isTrue(Number.isInteger(sequence));

        this._weight = weight;
        this._sequence = sequence;
    }

    get weight() {
        return this._weight;
    }

    get sequence() {
        return this._sequence;
    }

    /**
     * @public
     * @param {HuffmanTreePriority} other
     * @returns {boolean}
     */
    compare(other) {
        Assert.isTrue(other instanceof HuffmanTreePriority);

        if (this._weight === other._weight) {
            return this._sequence < other._sequence;
        }

        return this._weight > other._weight;
    }
}

export default HuffmanTreePriority;
