'use strict';

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderCoordinate extends FieldDecoder {
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
        return bitBuffer.readCoordinate();
    }
}

module.exports = FieldDecoderCoordinate;
