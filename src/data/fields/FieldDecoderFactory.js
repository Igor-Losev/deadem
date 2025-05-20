'use strict';

const assert = require('assert/strict');

const FieldDecoderCoordinate = require('./decoders/FieldDecoderCoordinate'),
    FieldDecoderNoScale = require('./decoders/FieldDecoderNoScale'),
    FieldDecoderQAngle = require('./decoders/FieldDecoderQAngle'),
    FieldDecoderQuantizedFloat = require('./decoders/FieldDecoderQuantizedFloat'),
    FieldDecoderRuneTime = require('./decoders/FieldDecoderRuneTime'),
    FieldDecoderSimulationTime = require('./decoders/FieldDecoderSimulationTime'),
    FieldDecoderUInt64 = require('./decoders/FieldDecoderUInt64'),
    FieldDecoderUVarInt64 = require('./decoders/FieldDecoderUVarInt64'),
    FieldDecoderVectorN = require('./decoders/FieldDecoderVectorN'),
    FieldDecoderVectorNormal = require('./decoders/FieldDecoderVectorNormal');

const FieldDecoderInstructions = require('./FieldDecoderInstructions');

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

module.exports = FieldDecoderFactory;
