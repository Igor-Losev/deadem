import Assert from '#core/Assert.js';
import BinaryHeap from '#core/BinaryHeap.js';

import FieldPathOperation from '#data/enums/FieldPathOperation.js';

import HuffmanTreePriority from './HuffmanTreePriority.js';

const HUFFMAN_TREE_DEPTH = 17;
const MAX_CODE = (1 << HUFFMAN_TREE_DEPTH) - 1;
const OPERATIONS = FieldPathOperation.getAll();

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
        Assert.isTrue(priority instanceof HuffmanTreePriority);
        Assert.isTrue(!operation || operation instanceof FieldPathOperation);
        Assert.isTrue(!leftChild || leftChild instanceof HuffmanTree);
        Assert.isTrue(!rightChild || rightChild instanceof HuffmanTree);

        this._priority = priority;
        this._operation = operation || null;
        this._leftChild = leftChild || null;
        this._rightChild = rightChild || null;
    }

    /**
     * The depth of the HuffmanTree.
     *
     * @static
     * @returns {number}
     */
    static get DEPTH() {
        return HUFFMAN_TREE_DEPTH;
    }

    /**
     * @static
     * @param {number} code - The code.
     * @returns {{bitsUsed: number, operation: FieldPathOperation}}
     */
    static getOperationByCode(code) {
        Assert.isTrue(code < MAX_CODE);

        const bitsUsed = PRECALCULATED_TABLE.bits[code];
        const operationIndex = PRECALCULATED_TABLE.operations[code];

        return { bitsUsed, operation: OPERATIONS[operationIndex] };
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

    /**
     * @public
     * @returns {boolean}
     */
    getIsLeaf() {
        return this._leftChild === null && this._rightChild === null;
    }
}

const TREE = {
    codeTable: new Map(),
    depth: 0,
    root: build()
};

let PRECALCULATED_TABLE;

(() => {
    dfs(TREE.root);

    if (TREE.depth !== HUFFMAN_TREE_DEPTH) {
        throw new Error(`Unexpected HuffmanTree depth [ ${TREE.depth} ]`);
    }

    PRECALCULATED_TABLE = {
        bits: Buffer.allocUnsafe(MAX_CODE),
        operations: Buffer.allocUnsafe(MAX_CODE)
    };

    for (let code = 0; code < MAX_CODE; code++) {
        const { bits, node } = getNodeByCode(code);

        PRECALCULATED_TABLE.bits[code] = bits;
        PRECALCULATED_TABLE.operations[code] = node.operation.sequence;
    }
})();

/**
 * Builds a {@link HuffmanTree}
 *
 * @returns {HuffmanTree} - The root.
 */
function build() {
    const weigh = operation => Math.max(operation.weight, 1);

    const heap = new BinaryHeap(huffmanTree => huffmanTree.priority, (priorityA, priorityB) => priorityA.compare(priorityB));

    OPERATIONS.forEach((operation) => {
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

/**
 * Traverses a {@link HuffmanTree} according to the binary path,
 * mapping the path to the corresponding node in the TREE.codeTable.
 * Updates the maximum depth of the tree.
 *
 * @param {HuffmanTree} node
 * @param {String} path
 * @param {number} depth
 */
function dfs(node, path = '', depth = 0) {
    if (TREE.depth < depth) {
        TREE.depth = depth;
    }

    if (node.leftChild) {
        dfs(node.leftChild, path + '0', depth + 1);
    }

    if (node.rightChild) {
        dfs(node.rightChild, path + '1', depth + 1);
    }

    if (node.getIsLeaf()) {
        const code = parseInt(path, 2);

        TREE.codeTable.set(code, node);
    }
}

/**
 * Given a code, searches for the shortest prefix that matches a key in the TREE.codeTable.
 *
 * @param {number} code - A decimal number whose binary form (or form of its prefix) determines the traversal path.
 * @returns {{bits: number, node: HuffmanTree}}
 */
function getNodeByCode(code) {
    let bits = 0;
    let prefix = 0;

    for (let i = 0; i < TREE.depth; i++) {
        const iBit = (code >> i) & 1;

        prefix = prefix << 1;

        if (iBit) {
            prefix |= iBit;
        }

        bits += 1;

        if (TREE.codeTable.has(prefix)) {
            return { bits, node: TREE.codeTable.get(prefix) };
        }
    }

    throw new Error(`Unable to find a node for code [ ${code} ]. This should never happen. Verify the depth of the tree`);
}

export default HuffmanTree;
