'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderUVarInt64 extends FieldDecoder {
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
        return bitBuffer.readUVarInt64();
    }
}

module.exports = FieldDecoderUVarInt64;
