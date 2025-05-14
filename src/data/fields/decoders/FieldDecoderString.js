'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderString extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {string}
     */
    _decode(bitBuffer) {
        return bitBuffer.readString();
    }
}

module.exports = FieldDecoderString;
