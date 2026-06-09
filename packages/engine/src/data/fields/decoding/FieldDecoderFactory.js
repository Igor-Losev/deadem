import Assert from '#core/Assert.js';

import FieldDecoder from './FieldDecoder.js';
import FieldDecoderInstructions from './FieldDecoderInstructions.js';
import FieldDecoderQuantizedFloat from './FieldDecoderQuantizedFloat.js';
import FieldStorageDescriptor from './FieldStorageDescriptor.js';

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
     * @returns {(BitBuffer) => string}
     */
    static get BINARY_BLOCK() {
        return decodeBinaryBlock;
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
     * @returns {(BitBuffer) => boolean}
     */
    static get GAME_MODE_RULES() {
        return decodeGameModeRules;
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
    static get FIXED_UINT_64() {
        return decodeUInt64;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => number}
     */
    static get VAR_UINT_32() {
        return decodeUVarInt32;
    }

    /**
     * @public
     * @static
     * @returns {(BitBuffer) => BigInt}
     */
    static get VAR_UINT_64() {
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
     * @returns {FieldDecoder}
     */
    createFloat32(instructions) {
        return this._createFloat32(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    createQAngle(instructions) {
        return this._createQAngle(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    createQuantizedFloat(instructions) {
        return this._createQuantizedFloat(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    createUInt64(instructions) {
        return this._createUInt64(instructions);
    }

    /**
     * @public
     * @param {FieldDecoderInstructions} instructions
     * @param {number} dimension
     * @returns {FieldDecoder}
     */
    createVector(instructions, dimension) {
        return this._createVector(instructions, dimension);
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    _createFloat32(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        const existing = this._registryFloat32.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        let resolved;

        if (instructions.encoder === 'coord') {
            resolved = new FieldDecoder(FieldDecoderFactory.COORDINATE, FieldStorageDescriptor.FLOAT);
        } else if (instructions.encoder === 'simtime') {
            resolved = new FieldDecoder(FieldDecoderFactory.SIMULATION_TIME, FieldStorageDescriptor.INT_UNSIGNED);
        } else if (instructions.bitCount === null || instructions.bitCount <= 0 || instructions.bitCount >= 32) {
            resolved = new FieldDecoder(FieldDecoderFactory.NO_SCALE, FieldStorageDescriptor.FLOAT);
        } else {
            resolved = this._createQuantizedFloat(instructions);
        }

        this._registryFloat32.set(instructions, resolved);

        return resolved;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
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
                    if (hasRoll) result[2] = bitBuffer.readCoordinate();
                }
            }

            return result;
        };

        const resolved = new FieldDecoder(qAngleDecoder, FieldStorageDescriptor.createVector(3));

        this._registryQAngle.set(instructions, resolved);

        return resolved;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    _createQuantizedFloat(instructions) {
        const existing = this._registryQuantizedFloat.get(instructions) || null;

        if (existing !== null) {
            return existing;
        }

        const decoder = new FieldDecoderQuantizedFloat(instructions);
        const decoderFn = bitBuffer => decoder.decode(bitBuffer);

        const resolved = new FieldDecoder(decoderFn, FieldStorageDescriptor.FLOAT);

        this._registryQuantizedFloat.set(instructions, resolved);

        return resolved;
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @returns {FieldDecoder}
     */
    _createUInt64(instructions) {
        Assert.isTrue(instructions instanceof FieldDecoderInstructions);

        if (instructions.encoder === 'fixed64') {
            return new FieldDecoder(FieldDecoderFactory.FIXED_UINT_64, FieldStorageDescriptor.MISC);
        } else {
            return new FieldDecoder(FieldDecoderFactory.VAR_UINT_64, FieldStorageDescriptor.MISC);
        }
    }

    /**
     * @protected
     * @param {FieldDecoderInstructions} instructions
     * @param {number} dimension
     * @returns {FieldDecoder}
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
            const resolved = new FieldDecoder(FieldDecoderFactory.NORMAL_VECTOR, FieldStorageDescriptor.createVector(3));

            registry.set(instructions, resolved);

            return resolved;
        }

        const valueDecoder = this._createFloat32(instructions).fn;

        const vectorNDecoder = (bitBuffer) => {
            const vector = new Float32Array(dimension);

            for (let i = 0; i < dimension; i++) {
                vector[i] = valueDecoder(bitBuffer);
            }

            return vector;
        };

        const resolved = new FieldDecoder(vectorNDecoder, FieldStorageDescriptor.createVector(dimension));

        registry.set(instructions, resolved);

        return resolved;
    }
}

const textDecoder = new TextDecoder('utf-8', { fatal: false });

const decodeBinaryBlock = (bitBuffer) => {
    const length = bitBuffer.readUVarInt32();
    const bytes = bitBuffer.read(length * 8, true);

    return textDecoder.decode(bytes.subarray(0, length));
};
const decodeBoolean = bitBuffer => bitBuffer.readBit();
const decodeCoordinate = bitBuffer => bitBuffer.readCoordinate();
const decodeGameModeRules = (bitBuffer) => {
    const value = bitBuffer.readBit();

    bitBuffer.readUVarInt();

    return value;
};
const decodeNormalVector = bitBuffer => bitBuffer.readNormalVector();
const decodeNoScale = bitBuffer => bitBuffer.readFloat32();
const decodeSimulationTime = bitBuffer => bitBuffer.readUVarInt32();
const decodeString = bitBuffer => bitBuffer.readString();
const decodeUInt64 = bitBuffer => bitBuffer.readUInt64();
const decodeUVarInt32 = bitBuffer => bitBuffer.readUVarInt32();
const decodeUVarInt64 = bitBuffer => bitBuffer.readUVarInt64();
const decodeVarInt32 = bitBuffer => bitBuffer.readVarInt32();
const decodeVarInt64 = bitBuffer => bitBuffer.readVarInt64();

export default FieldDecoderFactory;
