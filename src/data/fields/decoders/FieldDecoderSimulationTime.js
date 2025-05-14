'use strict';

const assert = require('assert/strict');

const FieldDecoder = require('./FieldDecoder');

class FieldDecoderSimulationTime extends FieldDecoder {
    /**
     * @constructor
     */
    constructor(tickRate = 60) {
        super();

        assert(Number.isSafeInteger(tickRate) && tickRate > 0);

        this._tickRate = tickRate;
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number}
     */
    _decode(bitBuffer) {
        const tick = bitBuffer.readUVarInt32();

        return tick / this._tickRate;
    }
}

module.exports = FieldDecoderSimulationTime;
