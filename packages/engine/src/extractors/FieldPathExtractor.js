/** @import BitReader from '../core/BitReader.js' */

import FieldPathOperation from '../data/enums/FieldPathOperation.js';

import HuffmanTree from '../data/fields/path/HuffmanTree.js';
import FieldPathBuilder from '../data/fields/path/FieldPathBuilder.js';

const HUFFMAN_TREE_DEPTH = HuffmanTree.DEPTH;
const OPERATIONS = HuffmanTree.OPERATIONS;
const BITS_TABLE = HuffmanTree.PRECALCULATED_TABLE.bits;
const OPS_TABLE = HuffmanTree.PRECALCULATED_TABLE.operations;

class FieldPathExtractor {
    /**
     * @public
     * @constructor
     * @param {BitReader} bitReader
     */
    constructor(bitReader) {
        /** @private */
        this._bitReader = bitReader;

        /** @private */
        this._fieldPathBuilder = new FieldPathBuilder();
        /** @private @type {Array<number>} */
        this._ids = [ ];
    }

    /**
     * @public
     * @returns {Array<number>}
     */
    allIds() {
        const bitReader = this._bitReader;
        const builder = this._fieldPathBuilder;
        const ids = this._ids;

        builder.reset();

        let count = 0;

        for (;;) {
            const unread = bitReader.getUnreadCount();

            if (unread <= 0) {
                break;
            }

            const bits = unread < HUFFMAN_TREE_DEPTH ? unread : HUFFMAN_TREE_DEPTH;

            const code = bitReader.readBitsAsUInt(bits);

            const bitsUsed = BITS_TABLE[code];
            const operation = OPERATIONS[OPS_TABLE[code]];

            bitReader.moveBack(bits - bitsUsed);

            if (operation === FieldPathOperation.FINISH) {
                break;
            }

            /** @type {Function} */ (operation.executor)(bitReader, builder);

            ids[count++] = builder.build().id;
        }

        ids.length = count;

        return ids;
    }
}

export default FieldPathExtractor;
