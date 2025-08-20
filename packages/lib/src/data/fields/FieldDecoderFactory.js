import Assert from '#core/Assert.js';

import FieldDecoderQuantizedFloat from './decoders/FieldDecoderQuantizedFloat.js';

import FieldDecoderInstructions from './FieldDecoderInstructions.js';

class FieldDecoderFactory {
    constructor() {
        this._registryFloat32 = new Map();
        this._registryQAngle = new Map();
        this._registryQuantizedFloat = new Map();

        this._registryVector = {
            2: new Map(),
            3: new Map(),
            4: new Map()
        };
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => boolean}
     */
    static get BOOLEAN() {
        return decodeBoolean;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get COORDINATE() {
        return decodeCoordinate;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => Float32Array}
     */
    static get NORMAL_VECTOR() {
        return decodeNormalVector;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get NO_SCALE() {
        return decodeNoScale;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get SIMULATION_TIME() {
        return decodeSimulationTime;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => string}
     */
    static get STRING() {
        return decodeString;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => BigInt}
     */
    static get U_INT_64() {
        return decodeUInt64;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get U_VAR_INT_32() {
        return decodeUVarInt32;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => BigInt}
     */
    static get U_VAR_INT_64() {
        return decodeUVarInt64;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get VAR_INT_32() {
        return decodeVarInt32;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => BigInt}
     */
    static get VAR_INT_64() {
        return decodeVarInt64;
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => number}
     */
    createFloat32(instructions) {
        return this._createFloat32(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => Float32Array}
     */
    createQAngle(instructions) {
        return this._createQAngle(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => number}
     */
    createQuantizedFloat(instructions) {
        return this._createQuantizedFloat(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => BigInt}
     */
    createUInt64(instructions) {
        return this._createUInt64(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @param {number} dimension
     * @returns {(bitBuffer: BitBuffer) => Float32Array}
     */
    createVector(instructions, dimension) {
        return this._createVector(instructions, dimension);
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => number}
     */
    _createFloat32(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        const existing = this._registryFloat32.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        let decoder;

        if (instructions.encoder === 'coord') {
            decoder = FieldDecoderFactory.COORDINATE;
        } else if (instructions.encoder === 'simtime') {
            decoder = FieldDecoderFactory.SIMULATION_TIME;
        } else if (instructions.bitCount === null || instructions.bitCount <= 0 || instructions.bitCount >= 32) {
            decoder = FieldDecoderFactory.NO_SCALE;
        } else {
            decoder = this._createQuantizedFloat(instructions);
        }

        this._registryFloat32.set(instructions, decoder);

        return decoder;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => Float32Array}
     */
    _createQAngle(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        const existing = this._registryQAngle.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        const qAngleDecoder = (bitBuffer) => {
            const result = new Float32Array(3);

            if (instructions.encoder === 'qangle_pitch_yaw') {
                result[0] = bitBuffer.readAngle(instructions.bitCount);
                result[1] = bitBuffer.readAngle(instructions.bitCount);
            } else if (instructions.bitCount !== null && instructions.bitCount !== 0) {
                result[0] = bitBuffer.readAngle(instructions.bitCount);
                result[1] = bitBuffer.readAngle(instructions.bitCount);
                result[2] = bitBuffer.readAngle(instructions.bitCount);
            } else {
                const isPrecise = instructions.encoder === 'qangle_precise';

                const hasPitch = bitBuffer.readBit();
                const hasYaw = bitBuffer.readBit();
                const hasRoll = bitBuffer.readBit();

                if (isPrecise) {
                    if (hasPitch) result[0] = bitBuffer.readCoordinatePrecise();
                    if (hasYaw) result[1] = bitBuffer.readCoordinatePrecise();
                    if (hasRoll) result[2] = bitBuffer.readCoordinatePrecise();
                } else {
                    if (hasPitch) result[0] = bitBuffer.readCoordinate();
                    if (hasYaw) result[1] = bitBuffer.readCoordinate();
                    if (hasRoll)  result[2] = bitBuffer.readCoordinate();
                }
            }

            return result;
        };

        this._registryQAngle.set(instructions, qAngleDecoder);

        return qAngleDecoder;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => number}
     */
    _createQuantizedFloat(instructions) {
        const existing = this._registryQuantizedFloat.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        const decoder = new FieldDecoderQuantizedFloat(instructions);
        const decoderFn = bitBuffer => decoder.decode(bitBuffer);

        this._registryQuantizedFloat.set(instructions, decoderFn);

        return decoderFn;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {(bitBuffer: BitBuffer) => BigInt}
     */
    _createUInt64(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        if (instructions.encoder === 'fixed64') {
            return FieldDecoderFactory.U_INT_64;
        } else {
            return FieldDecoderFactory.U_VAR_INT_64;
        }
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @param {number} dimension
     * @returns {(bitBuffer: BitBuffer) => Float32Array}
     */
    _createVector(instructions, dimension) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);
        Assert.isTrue(Number.isInteger(dimension) && dimension >= 2 && dimension <= 4);

        const registry = this._registryVector[dimension] || null;

        if (registry === null) {
            throw new Error(`Unable to find registry for vector with dimension [ ${dimension} ]`);
        }

        const existing = registry.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        if (dimension === 3 && instructions.encoder === 'normal') {
            registry.set(instructions, FieldDecoderFactory.NORMAL_VECTOR);

            return FieldDecoderFactory.NORMAL_VECTOR;
        }

        const valueDecoder = this._createFloat32(instructions);

        const vectorNDecoder = (bitBuffer) => {
            const vector = new Float32Array(dimension);

            for (let i = 0; i < dimension; i++) {
                vector[i] = valueDecoder(bitBuffer);
            }

            return vector;
        };

        registry.set(instructions, vectorNDecoder);

        return vectorNDecoder;
    }
}

const decodeBoolean = bitBuffer => bitBuffer.readBit();
const decodeCoordinate = bitBuffer => bitBuffer.readCoordinate();
const decodeNormalVector = bitBuffer => bitBuffer.readNormalVector();
const decodeNoScale = bitBuffer => bitBuffer.read(32).readFloatLE();
const decodeSimulationTime = bitBuffer => bitBuffer.readUVarInt32();
const decodeString = bitBuffer => bitBuffer.readString();
const decodeUInt64 = bitBuffer => bitBuffer.read(64).readBigUInt64LE();
const decodeUVarInt32 = bitBuffer => bitBuffer.readUVarInt32();
const decodeUVarInt64 = bitBuffer => bitBuffer.readUVarInt64();
const decodeVarInt32 = bitBuffer => bitBuffer.readVarInt32();
const decodeVarInt64 = bitBuffer => bitBuffer.readVarInt64();

export default FieldDecoderFactory;
