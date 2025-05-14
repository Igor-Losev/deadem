'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderVectorNormal extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number[]}
     */
    _decode(bitBuffer) {
        return bitBuffer.readNormalVector();
    }
}

module.exports = FieldDecoderVectorNormal;
