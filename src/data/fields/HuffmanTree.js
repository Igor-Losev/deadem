'use strict';

const assert = require('node:assert/strict');

const BinaryHeap = require('./../../data/structures/BinaryHeap');

const FieldPathOperation = require('../enums/FieldPathOperation');

const HuffmanTreePriority = require('./HuffmanTreePriority');

class HuffmanTree {
    /**
     * @public
     * @constructor
     * @param {HuffmanTreePriority} priority
     * @param {FieldPathOperation=} operation
     * @param {HuffmanTree=} leftChild
     * @param {HuffmanTree=} rightChild
     */
    constructor(priority, operation, leftChild, rightChild) {
        assert(priority instanceof HuffmanTreePriority);
        assert(!operation || operation instanceof FieldPathOperation);
        assert(!leftChild || leftChild instanceof HuffmanTree);
        assert(!rightChild || rightChild instanceof HuffmanTree);

        this._priority = priority;
        this._operation = operation || null;
        this._leftChild = leftChild || null;
        this._rightChild = rightChild || null;
    }

    static get ROOT() {
        return root;
    }

    /**
     * @public
     * @returns {HuffmanTreePriority}
     */
    get priority() {
        return this._priority;
    }

    /**
     * @public
     * @returns {FieldPathOperation|null}
     */
    get operation() {
        return this._operation;
    }

    /**
     * @public
     * @returns {HuffmanTree|null}
     */
    get leftChild() {
        return this._leftChild;
    }

    /**
     * @public
     * @returns {HuffmanTree|null}
     */
    get rightChild() {
        return this._rightChild;
    }
}

const root = build();

function build() {
    const weigh = operation => Math.max(operation.weight, 1);

    const operations = FieldPathOperation.getAll();

    const heap = new BinaryHeap(huffmanTree => huffmanTree.priority, (priorityA, priorityB) => priorityA.compare(priorityB));

    operations.forEach((operation) => {
        const weight = weigh(operation);

        const huffmanTreePriority = new HuffmanTreePriority(weight, operation.sequence);
        const huffmanTree = new HuffmanTree(huffmanTreePriority, operation);

        heap.insert(huffmanTree);
    });

    let sequence = heap.length;

    while (heap.length > 1) {
        const childA = heap.extract();
        const childB = heap.extract();

        const huffmanTreePriority = new HuffmanTreePriority(childA.priority.weight + childB.priority.weight, sequence);
        const huffmanTree = new HuffmanTree(huffmanTreePriority, null, childA, childB);

        sequence += 1;

        heap.insert(huffmanTree);
    }

    return heap.extract();
}

module.exports = HuffmanTree;
