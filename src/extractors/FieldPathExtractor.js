import Assert from './../core/Assert.js';
import BitBuffer from '../core/BitBuffer.js';

import FieldPathOperation from './../data/enums/FieldPathOperation.js';

import FieldPathBuilder from '../data/fields/path/FieldPathBuilder.js';
import HuffmanTree from './../data/fields/HuffmanTree.js';

class FieldPathExtractor {
    /**
     * @public
     * @constructor
     * @param {BitBuffer} bitBuffer
     */
    constructor(bitBuffer) {
        Assert.isTrue(bitBuffer instanceof BitBuffer);

        this._bitBuffer = bitBuffer;

        this._fieldPathBuilder = new FieldPathBuilder();
    }

    /**
     * @public
     * @returns {Array<FieldPath>}
     */
    all() {
        const fieldPaths = [ ];

        for (let fieldPath = this._extractOnce(); fieldPath !== null; fieldPath = this._extractOnce()) {
            fieldPaths.push(fieldPath);
        }

        return fieldPaths;
    }

    /**
     * @generator
     * @yields {FieldPath}
     * @returns {void}
     */
    *retrieve() {
        for (let fieldPath = this._extractOnce(); fieldPath !== null; fieldPath = this._extractOnce()) {
            yield fieldPath;
        }
    }

    /**
     * @public
     */
    reset() {
        this._bitBuffer.reset();
        this._fieldPathBuilder = new FieldPathBuilder();
    }

    /**
     * @protected
     * @returns {FieldPath}
     */
    _extractOnce() {
        const bits = Math.min(this._bitBuffer.getUnreadCount(), HuffmanTree.DEPTH);

        const code = BitBuffer.readUInt32LE(this._bitBuffer.read(bits));

        const { bitsUsed, operation } = HuffmanTree.getOperationByCode(code);

        this._bitBuffer.move(-(bits - bitsUsed));

        if (operation === FieldPathOperation.FINISH) {
            return null;
        }

        operation.executor(this._bitBuffer, this._fieldPathBuilder);

        return this._fieldPathBuilder.build();
    }
}

export default FieldPathExtractor;
