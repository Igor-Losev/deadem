'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderComponent extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {0|1}
     */
    _decode(bitBuffer) {
        return bitBuffer.readBit();
    }
}

module.exports = FieldDecoderComponent;
