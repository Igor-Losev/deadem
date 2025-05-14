'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderUInt64 extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {BigInt}
     */
    _decode(bitBuffer) {
        return bitBuffer.read(64).readBigUInt64LE();
    }
}

module.exports = FieldDecoderUInt64;
