import FieldPathOperation from '#data/enums/FieldPathOperation.js';

import HuffmanTree from '#data/fields/HuffmanTree.js';
import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

const HUFFMAN_TREE_DEPTH = HuffmanTree.DEPTH;
const OPERATIONS = HuffmanTree.OPERATIONS;
const BITS_TABLE = HuffmanTree.PRECALCULATED_TABLE.bits;
const OPS_TABLE = HuffmanTree.PRECALCULATED_TABLE.operations;

class FieldPathExtractor {
    /**
     * @public
     * @constructor
     * @param {BitBuffer} bitBuffer
     */
    constructor(bitBuffer) {
        this._bitBuffer = bitBuffer;

        this._fieldPathBuilder = new FieldPathBuilder();
    }

    /**
     * @public
     * @returns {Array<FieldPath>}
     */
    all() {
        const bitBuffer = this._bitBuffer;
        const builder = this._fieldPathBuilder;
        const fieldPaths = [ ];

        for (;;) {
            const unread = bitBuffer.getUnreadCount();
            const bits = unread < HUFFMAN_TREE_DEPTH ? unread : HUFFMAN_TREE_DEPTH;

            const code = bitBuffer.readBitsAsUInt(bits);

            const bitsUsed = BITS_TABLE[code];
            const operation = OPERATIONS[OPS_TABLE[code]];

            bitBuffer.moveBack(bits - bitsUsed);

            if (operation === FieldPathOperation.FINISH) {
                break;
            }

            operation._executor(bitBuffer, builder);

            fieldPaths.push(builder.build());
        }

        return fieldPaths;
    }

    /**
     * @generator
     * @yields {FieldPath}
     */
    *retrieve() {
        const bitBuffer = this._bitBuffer;
        const builder = this._fieldPathBuilder;

        for (;;) {
            const unread = bitBuffer.getUnreadCount();
            const bits = unread < HUFFMAN_TREE_DEPTH ? unread : HUFFMAN_TREE_DEPTH;

            const code = bitBuffer.readBitsAsUInt(bits);

            const bitsUsed = BITS_TABLE[code];
            const operation = OPERATIONS[OPS_TABLE[code]];

            bitBuffer.moveBack(bits - bitsUsed);

            if (operation === FieldPathOperation.FINISH) {
                break;
            }

            operation._executor(bitBuffer, builder);

            yield builder.build();
        }
    }

    /**
     * @public
     */
    reset() {
        this._bitBuffer.reset();
        this._fieldPathBuilder = new FieldPathBuilder();
    }
}

export default FieldPathExtractor;
