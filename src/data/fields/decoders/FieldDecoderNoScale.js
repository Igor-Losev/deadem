'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderNoScale extends FieldDecoder {
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
        return bitBuffer.read(32).readFloatLE();
    }
}

module.exports = FieldDecoderNoScale;

