'use strict';

const assert = require('node:assert/strict');

const BitBuffer = require('./../data/buffer/BitBufferFast');

const FieldPathOperation = require('./../data/enums/FieldPathOperation');

const FieldPath = require('./../data/fields/FieldPath'),
    HuffmanTree = require('./../data/fields/HuffmanTree');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('FieldPathExtractor');

class FieldPathExtractor {
    /**
     * @public
     * @constructor
     * @param {Buffer|BitBuffer} buffer
     */
    constructor(buffer) {
        assert(Buffer.isBuffer(buffer) || buffer instanceof BitBuffer);

        let bitBuffer;

        if (Buffer.isBuffer(buffer)) {
            bitBuffer = new BitBuffer(buffer);
        } else {
            bitBuffer = buffer;
        }

        this._bitBuffer = bitBuffer;
    }

    *retrieve() {
        let node = HuffmanTree.ROOT;

        let fieldPath = new FieldPath();

        while (true) {
            let next;

            const right = this._bitBuffer.readBit();

            if (right) {
                next = node.rightChild;
            } else {
                next = node.leftChild;
            }

            if (next.getIsLeaf()) {
                const operation = next.operation;

                if (operation === null) {
                    throw new Error(`HuffmanTree leaf doesn't have an operation set. This should never happen`);
                }

                if (operation === FieldPathOperation.FINISH) {
                    logger.debug(`Found operation [ ${FieldPathOperation.FINISH.code} ]. Finishing`);

                    break;
                }

                logger.debug(`Executing operation [ ${operation.code} ]`);

                operation.executor(this._bitBuffer, fieldPath);

                yield fieldPath.clone();

                node = HuffmanTree.ROOT;
            } else {
                node = next;
            }
        }
    }
}

module.exports = FieldPathExtractor;
