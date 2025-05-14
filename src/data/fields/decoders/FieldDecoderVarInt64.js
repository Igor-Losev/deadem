'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderVarInt64 extends FieldDecoder {
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
        return bitBuffer.readVarInt64();
    }
}

module.exports = FieldDecoderVarInt64;
