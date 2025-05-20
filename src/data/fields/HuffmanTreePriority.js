'use strict';

const assert = require('node:assert/strict');

class HuffmanTreePriority {
    /**
     * @public
     * @constructor
     * @param {number} weight
     * @param {number} sequence
     */
    constructor(weight, sequence) {
        assert(Number.isInteger(weight));
        assert(Number.isInteger(sequence));

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
        assert(other instanceof HuffmanTreePriority);

        if (this._weight === other._weight) {
            return this._sequence < other._sequence;
        }

        return this._weight > other._weight;
    }
}

module.exports = HuffmanTreePriority;
