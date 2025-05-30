import Assert from '#core/Assert.js';

import FieldDecoder from './FieldDecoder.js';
import FieldDecoderInstructions from './../FieldDecoderInstructions.js';

class FieldDecoderQAngle extends FieldDecoder {
    /**
     * @constructor
     * @param {FieldDecoderInstructions} instructions
     */
    constructor(instructions) {
        super();

        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

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

        const hasPitch = bitBuffer.readBit();
        const hasYaw = bitBuffer.readBit();
        const hasRoll = bitBuffer.readBit();

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

export default FieldDecoderQAngle;
