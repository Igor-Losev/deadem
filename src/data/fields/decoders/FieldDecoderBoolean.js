'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderBoolean extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {boolean}
     */
    _decode(bitBuffer) {
        return bitBuffer.readBit() === 1;
    }
}

module.exports = FieldDecoderBoolean;
