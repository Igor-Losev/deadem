/** @import BitBuffer from '#core/BitBuffer.js' */

import FieldPathOperation from '#data/enums/FieldPathOperation.js';

import HuffmanTree from '#data/fields/path/HuffmanTree.js';
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
        /** @type {Array<number>} */
        this._ids = [ ];
    }

    /**
     * @public
     * @returns {Array<number>}
     */
    allIds() {
        const bitBuffer = this._bitBuffer;
        const builder = this._fieldPathBuilder;
        const ids = this._ids;

        builder.reset();

        let count = 0;

        for (;;) {
            const unread = bitBuffer.getUnreadCount();

            if (unread <= 0) {
                break;
            }

            const bits = unread < HUFFMAN_TREE_DEPTH ? unread : HUFFMAN_TREE_DEPTH;

            const code = bitBuffer.readBitsAsUInt(bits);

            const bitsUsed = BITS_TABLE[code];
            const operation = OPERATIONS[OPS_TABLE[code]];

            bitBuffer.moveBack(bits - bitsUsed);

            if (operation === FieldPathOperation.FINISH) {
                break;
            }

            /** @type {Function} */ (operation._executor)(bitBuffer, builder);

            ids[count++] = builder.build().id;
        }

        ids.length = count;

        return ids;
    }
}

export default FieldPathExtractor;
