/** @import BitReader from '../../../core/BitReader.js' */

import Assert from '../../../core/Assert.js';

import FieldDecoder from './FieldDecoder.js';
import FieldDecoderInstructions from './FieldDecoderInstructions.js';
import FieldDecoderQuantizedFloat from './FieldDecoderQuantizedFloat.js';
import FieldStorageDescriptor from './FieldStorageDescriptor.js';

class FieldDecoderFactory {
    constructor() {
        /** @private */
        this._registryFloat32 = new Map();
        /** @private */
        this._registryQAngle = new Map();
        /** @private */
        this._registryQuantizedFloat = new Map();

        /** @private @type {{ [dimension: number]: Map<FieldDecoderInstructions, FieldDecoder> }} */
        this._registryVector = {
            2: new Map(),
            3: new Map(),
            4: new Map(),
            6: new Map()
        };
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => Uint8Array}
     */
    static get BINARY_BLOCK() {
        return decodeBinaryBlock;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => boolean}
     */
    static get BOOLEAN() {
        return decodeBoolean;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get COORDINATE() {
        return decodeCoordinate;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => boolean}
     */
    static get GAME_MODE_RULES() {
        return decodeGameModeRules;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => Float32Array}
     */
    static get NORMAL_VECTOR() {
        return decodeNormalVector;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get NO_SCALE() {
        return decodeNoScale;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get SIMULATION_TIME() {
        return decodeSimulationTime;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => string}
     */
    static get STRING() {
        return decodeString;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => bigint}
     */
    static get FIXED_UINT_64() {
        return decodeUInt64;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get FIXED_8() {
        return decodeFixed8;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get FIXED_8_SIGNED() {
        return decodeFixed8Signed;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get VAR_UINT_32() {
        return decodeUVarInt32;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get VAR_UINT_32_MINUS_ONE() {
        return decodeUVarInt32MinusOne;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => bigint}
     */
    static get VAR_UINT_64() {
        return decodeUVarInt64;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => number}
     */
    static get VAR_INT_32() {
        return decodeVarInt32;
    }

    /**
     * @public
     * @static
     * @returns {(bitReader: BitReader) => bigint}
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

        /** @type {(bitReader: BitReader) => Float32Array} */
        const qAngleDecoder = (bitReader) => {
            const result = new Float32Array(3);

            if (instructions.bitCount !== null && instructions.encoder === 'qangle_pitch_yaw') {
                result[0] = bitReader.readAngle(instructions.bitCount);
                result[1] = bitReader.readAngle(instructions.bitCount);
            } else if (instructions.bitCount !== null && instructions.bitCount >= 32) {
                result[0] = bitReader.readFloat32();
                result[1] = bitReader.readFloat32();
                result[2] = bitReader.readFloat32();
            } else if (instructions.encoder === 'qangle_precise') {
                const hasPitch = bitReader.readBit();
                const hasYaw = bitReader.readBit();
                const hasRoll = bitReader.readBit();

                if (hasPitch) result[0] = bitReader.readCoordinatePrecise();
                if (hasYaw) result[1] = bitReader.readCoordinatePrecise();
                if (hasRoll) result[2] = bitReader.readCoordinatePrecise();
            } else if (instructions.bitCount !== null && instructions.bitCount !== 0) {
                result[0] = bitReader.readAngle(instructions.bitCount);
                result[1] = bitReader.readAngle(instructions.bitCount);
                result[2] = bitReader.readAngle(instructions.bitCount);
            } else {
                const hasPitch = bitReader.readBit();
                const hasYaw = bitReader.readBit();
                const hasRoll = bitReader.readBit();

                if (hasPitch) result[0] = bitReader.readCoordinate();
                if (hasYaw) result[1] = bitReader.readCoordinate();
                if (hasRoll) result[2] = bitReader.readCoordinate();
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

        /** @type {(bitReader: BitReader) => number} */
        const decoderFn = bitReader => decoder.decode(bitReader);

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
        Assert.isTrue([ 2, 3, 4, 6 ].includes(dimension));

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

        /** @type {(bitReader: BitReader) => Float32Array} */
        const vectorNDecoder = (bitReader) => {
            const vector = new Float32Array(dimension);

            for (let i = 0; i < dimension; i++) {
                vector[i] = valueDecoder(bitReader);
            }

            return vector;
        };

        const resolved = new FieldDecoder(vectorNDecoder, FieldStorageDescriptor.createVector(dimension));

        registry.set(instructions, resolved);

        return resolved;
    }
}

/** @type {(bitReader: BitReader) => Uint8Array} */
const decodeBinaryBlock = (bitReader) => {
    const length = bitReader.readUVarInt32();

    return bitReader.read(length * 8, true);
};
/** @type {(bitReader: BitReader) => boolean} */
const decodeBoolean = bitReader => bitReader.readBit();
/** @type {(bitReader: BitReader) => number} */
const decodeCoordinate = bitReader => bitReader.readCoordinate();
/** @type {(bitReader: BitReader) => number} */
const decodeFixed8 = bitReader => bitReader.readBitsAsUInt(8);
/** @type {(bitReader: BitReader) => number} */
const decodeFixed8Signed = (bitReader) => {
    const value = bitReader.readBitsAsUInt(8);

    return value > 0x7f ? value - 0x100 : value;
};
/** @type {(bitReader: BitReader) => boolean} */
const decodeGameModeRules = (bitReader) => {
    const value = bitReader.readBit();

    bitReader.readUVarInt();

    return value;
};
/** @type {(bitReader: BitReader) => Float32Array} */
const decodeNormalVector = bitReader => bitReader.readNormalVector();
/** @type {(bitReader: BitReader) => number} */
const decodeNoScale = bitReader => bitReader.readFloat32();
/** @type {(bitReader: BitReader) => number} */
const decodeSimulationTime = bitReader => bitReader.readUVarInt32();
/** @type {(bitReader: BitReader) => string} */
const decodeString = bitReader => bitReader.readString();
/** @type {(bitReader: BitReader) => bigint} */
const decodeUInt64 = bitReader => bitReader.readUInt64();
/** @type {(bitReader: BitReader) => number} */
const decodeUVarInt32 = bitReader => bitReader.readUVarInt32();
/** @type {(bitReader: BitReader) => number} */
const decodeUVarInt32MinusOne = bitReader => bitReader.readUVarInt32() - 1;
/** @type {(bitReader: BitReader) => bigint} */
const decodeUVarInt64 = bitReader => bitReader.readUVarInt64();
/** @type {(bitReader: BitReader) => number} */
const decodeVarInt32 = bitReader => bitReader.readVarInt32();
/** @type {(bitReader: BitReader) => bigint} */
const decodeVarInt64 = bitReader => bitReader.readVarInt64();

export default FieldDecoderFactory;
