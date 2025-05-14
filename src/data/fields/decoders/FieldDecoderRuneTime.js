'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderRuneTime extends FieldDecoder {
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
        return bitBuffer.read(4).readUInt8();
    }
}

module.exports = FieldDecoderRuneTime;
