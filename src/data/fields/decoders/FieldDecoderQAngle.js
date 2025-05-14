'use strict';

const assert = require('assert/strict');

const FieldDecoder = require('./FieldDecoder'),
    FieldDecoderInstructions = require('./../FieldDecoderInstructions');

class FieldDecoderQAngle extends FieldDecoder {
    /**
     * @constructor
     * @param {FieldDecoderInstructions} instructions
     */
    constructor(instructions) {
        super();

        assert(instructions instanceof FieldDecoderInstructions);

        this._instructions = instructions;
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number[]}
     */
    _decode(bitBuffer) {
        if (getIsQAnglePitchYaw.call(this)) {
            const bits = this._instructions.bitCount;

            return [ bitBuffer.readAngle(bits), bitBuffer.readAngle(bits), 0 ];
        }

        if (getIsQAngleFixed.call(this)) {
            const bits = this._instructions.bitCount;

            return [ bitBuffer.readAngle(bits), bitBuffer.readAngle(bits), bitBuffer.readAngle(bits) ];
        }

        const isPrecise = getIsQAnglePrecise.call(this);

        const read = () => isPrecise
            ? bitBuffer.readCoordinatePrecise()
            : bitBuffer.readCoordinate();

        const hasPitch = bitBuffer.readBit() === 1;
        const hasYaw = bitBuffer.readBit() === 1;
        const hasRoll = bitBuffer.readBit() === 1;

        const result = [ 0, 0, 0 ];

        if (hasPitch) {
            result[0] = read();
        }

        if (hasYaw) {
            result[1] = read();
        }

        if (hasRoll) {
            result[2] = read();
        }

        return result;
    }
}

function getIsQAngleFixed() {
    return this._instructions.bitCount !== null && this._instructions.bitCount !== 0;
}

function getIsQAnglePitchYaw() {
    return this._instructions.encoder === 'qangle_pitch_yaw';
}

function getIsQAnglePrecise() {
    return this._instructions.encoder === 'qangle_precise';
}

module.exports = FieldDecoderQAngle;
