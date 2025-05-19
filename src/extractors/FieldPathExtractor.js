'use strict';

const assert = require('node:assert/strict');

const BitBuffer = require('./../data/buffer/BitBufferFast');

const FieldPathOperation = require('./../data/enums/FieldPathOperation');

const FieldPathBuilder = require('../data/fields/path/FieldPathBuilder'),
    HuffmanTree = require('./../data/fields/HuffmanTree');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('FieldPathExtractor');

class FieldPathExtractor {
    /**
     * @public
     * @constructor
     * @param {BitBuffer} bitBuffer
     */
    constructor(bitBuffer) {
        assert(bitBuffer instanceof BitBuffer);

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
            logger.debug(`Found operation [ ${FieldPathOperation.FINISH.code} ]. Finishing`);

            return null;
        }

        logger.debug(`Executing operation [ ${operation.code} ]`);

        operation.executor(this._bitBuffer, this._fieldPathBuilder);

        return this._fieldPathBuilder.build();
    }
}

module.exports = FieldPathExtractor;
