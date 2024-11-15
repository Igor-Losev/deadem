'use strict';

const assert = require('node:assert/strict');

class BinaryHeap {
    /**
     * @public
     * @constructor
     * @param {Function=} extractor
     * @param {Function=} comparator
     */
    constructor(extractor, comparator) {
        assert(!extractor || typeof extractor === 'function');
        assert(!comparator || typeof comparator === 'function');

        this._extractor = extractor || (i => i);
        this._comparator = comparator || BinaryHeap.MIN_HEAP_COMPARATOR;

        this._heap = [ ];
    }

    /**
     * @public
     * @static
     * @returns {function(Number, Number): boolean}
     */
    static get MAX_HEAP_COMPARATOR() {
        return (a, b) => a < b;
    }

    /**
     * @public
     * @static
     * @returns {function(Number, Number): boolean}
     */
    static get MIN_HEAP_COMPARATOR() {
        return (a, b) => a > b;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._heap.length;
    }

    /**
     * @public
     * @returns {*}
     */
    get root() {
        return this._heap[0];
    }

    /**
     * @public
     * @returns {*}
     */
    extract() {
        if (this._heap.length === 0) {
            return;
        }

        const element = this._heap[0];

        const last = this._heap.pop();

        if (this._heap.length !== 0) {
            this._heap[0] = last;

            this._siftDown(0);
        }

        return element;
    }

    /**
     * @public
     * @param {*} element
     */
    insert(element) {
        const length = this._heap.push(element);

        this._siftUp(length - 1);
    }

    /**
     * @protected
     * @param {Number} i
     */
    _siftUp(i) {
        assert(Number.isInteger(i) && i >= 0 && i < this._heap.length);

        let index = i;

        while (index > 0 && this._comparator(this._getValue(this._getIParent(index)), this._getValue(index))) {
            this._swap(this._getIParent(index), index);

            index = this._getIParent(index);
        }
    }

    /**
     * @protected
     * @param {Number} i
     */
    _siftDown(i) {
        assert(Number.isInteger(i) && i >= 0 && i < this._heap.length);

        let iTarget = i;

        while (this._getIChildLeft(iTarget) < this._heap.length) {
            const iChildLeft = this._getIChildLeft(iTarget);
            const iChildRight = this._getIChildRight(iTarget);

            let iCandidate;

            if (iChildRight < this._heap.length && this._comparator(this._getValue(iChildLeft), this._getValue(iChildRight))) {
                iCandidate = iChildRight;
            } else {
                iCandidate = iChildLeft;
            }

            if (!this._comparator(this._getValue(iTarget), this._getValue(iCandidate))) {
                break;
            }

            this._swap(iTarget, iCandidate);

            iTarget = iCandidate;
        }
    }

    /**
     * @protected
     * @param {Number} i
     * @returns {Number}
     */
    _getIChildLeft(i) {
        return i * 2 + 1;
    }

    /**
     * @protected
     * @param {Number} i
     * @returns {Number}
     */
    _getIChildRight(i) {
        return i * 2 + 2;
    }

    /**
     * @protected
     * @param {Number} i
     * @returns {Number}
     */
    _getIParent(i) {
        return Math.floor((i - 1) / 2);
    }

    /**
     * @protected
     * @param {Number} i
     * @returns {*}
     */
    _getValue(i) {
        assert(Number.isInteger(i) && i >= 0 && i < this._heap.length);

        return this._extractor(this._heap[i]);
    }

    /**
     * @protected
     * @param {Number} i
     * @param {Number} j
     */
    _swap(i, j) {
        assert(Number.isInteger(i) && i >= 0 && i < this._heap.length);
        assert(Number.isInteger(j) && j >= 0 && j < this._heap.length);

        const reference = this._heap[i];

        this._heap[i] = this._heap[j];
        this._heap[j] = reference;
    }
}

module.exports = BinaryHeap;
