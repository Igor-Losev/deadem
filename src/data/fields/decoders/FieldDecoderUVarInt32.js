'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderUVarInt32 extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number}
     */
    _decode(bitBuffer) {
        return bitBuffer.readUVarInt32();
    }
}

module.exports = FieldDecoderUVarInt32;
