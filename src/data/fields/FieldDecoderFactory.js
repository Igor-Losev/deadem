import assert from 'assert/strict';

import FieldDecoderCoordinate from './decoders/FieldDecoderCoordinate.js';
import FieldDecoderNoScale from './decoders/FieldDecoderNoScale.js';
import FieldDecoderQAngle from './decoders/FieldDecoderQAngle.js';
import FieldDecoderQuantizedFloat from './decoders/FieldDecoderQuantizedFloat.js';
import FieldDecoderRuneTime from './decoders/FieldDecoderRuneTime.js';
import FieldDecoderSimulationTime from './decoders/FieldDecoderSimulationTime.js';
import FieldDecoderUInt64 from './decoders/FieldDecoderUInt64.js';
import FieldDecoderUVarInt64 from './decoders/FieldDecoderUVarInt64.js';
import FieldDecoderVectorN from './decoders/FieldDecoderVectorN.js';
import FieldDecoderVectorNormal from './decoders/FieldDecoderVectorNormal.js';

import FieldDecoderInstructions from './FieldDecoderInstructions.js';

class FieldDecoderFactory {
    constructor() {

    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoderCoordinate|FieldDecoderNoScale|FieldDecoderQuantizedFloat|FieldDecoderRuneTime|FieldDecoderSimulationTime}
     */
    createFloat32(instructions) {
        assert(instructions instanceof FieldDecoderInstructions);

        if (instructions.encoder === 'coord') {
            return decoderCoordinate;
        } else if (instructions.encoder === 'runetime') {
            return decoderRuneTime;
        } else if (instructions.encoder === 'simtime') {
            return decoderSimulationTime;
        }

        if (instructions.bitCount === null || instructions.bitCount <= 0 || instructions.bitCount >= 32) {
            return decoderNoScale;
        }

        return this.createQuantizedFloat(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoderQAngle}
     */
    createQAngle(instructions) {
        assert(instructions instanceof FieldDecoderInstructions);

        return new FieldDecoderQAngle(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoderQuantizedFloat}
     */
    createQuantizedFloat(instructions) {
        assert(instructions instanceof FieldDecoderInstructions);

        return new FieldDecoderQuantizedFloat(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoderUInt64|FieldDecoderUVarInt64}
     */
    createUInt64(instructions) {
        assert(instructions instanceof FieldDecoderInstructions);

        if (instructions.encoder === 'fixed64') {
            return decoderUInt64;
        } else {
            return decoderUVarInt64;
        }
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @param {number} dimension
     * @returns {FieldDecoderVectorN|FieldDecoderVectorNormal}
     */
    createVector(instructions, dimension) {
        assert(instructions instanceof FieldDecoderInstructions);
        assert(Number.isInteger(dimension) && dimension >= 2 && dimension <= 4);

        if (dimension === 3 && instructions.encoder === 'normal') {
            return decoderVectorNormal;
        }

        const decoder = this.createFloat32(instructions);

        return new FieldDecoderVectorN(decoder, dimension);
    }
}

const decoderCoordinate = new FieldDecoderCoordinate();
const decoderNoScale = new FieldDecoderNoScale();
const decoderRuneTime = new FieldDecoderRuneTime();
const decoderSimulationTime = new FieldDecoderSimulationTime();
const decoderUInt64 = new FieldDecoderUInt64();
const decoderUVarInt64 = new FieldDecoderUVarInt64();
const decoderVectorNormal = new FieldDecoderVectorNormal();

export default FieldDecoderFactory;
