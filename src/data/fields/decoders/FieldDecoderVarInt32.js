'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderVarInt32 extends FieldDecoder {
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
        return bitBuffer.readVarInt32();
    }
}

module.exports = FieldDecoderVarInt32;
