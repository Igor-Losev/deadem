import Assert from '#core/Assert.js';

import FieldDecoderType from '#data/enums/FieldDecoderType.js';

import FieldDecoderDescriptor from './FieldDecoderDescriptor.js';
import FieldDecoderFactory from './FieldDecoderFactory.js';
import FieldDecoderInstructions from './FieldDecoderInstructions.js';

class FieldDecoderCatalog {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._factory = new FieldDecoderFactory();
    }

    /**
     * @public
     * @param {FieldDecoderDescriptor} descriptor
     * @param {FieldDecoderInstructions} decoderInstructions
     * @returns {Function}
     */
    resolve(descriptor, decoderInstructions) {
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);
        Assert.isTrue(decoderInstructions instanceof FieldDecoderInstructions);

        const decoder = registry.get(descriptor.type) || null;

        if (decoder !== null) {
            return decoder;
        }

        switch (descriptor.type) {
            case FieldDecoderType.DYNAMIC_FLOAT_32:
                return this._factory.createFloat32(decoderInstructions);
            case FieldDecoderType.DYNAMIC_UINT_64:
                return this._factory.createUInt64(decoderInstructions);
            case FieldDecoderType.QANGLE:
                return this._factory.createQAngle(decoderInstructions);
            case FieldDecoderType.QUANTIZED_FLOAT:
                return this._factory.createQuantizedFloat(decoderInstructions);
            case FieldDecoderType.VECTOR:
                return this._factory.createVector(decoderInstructions, descriptor.options.dimension);
            default:
                throw new Error(`Unhandled field decoder type [ ${descriptor.type.code} ]`);
        }
    }
}

/**
 * @typedef {(bitBuffer: BitBuffer) => *} Decoder
 *
 * @type {Map<FieldDecoderType, Decoder>}
 */
const registry = new Map();

registry.set(FieldDecoderType.BINARY_BLOCK, FieldDecoderFactory.BINARY_BLOCK);
registry.set(FieldDecoderType.BOOLEAN, FieldDecoderFactory.BOOLEAN);
registry.set(FieldDecoderType.COORDINATE, FieldDecoderFactory.COORDINATE);
registry.set(FieldDecoderType.FIXED_UINT_64, FieldDecoderFactory.FIXED_UINT_64);
registry.set(FieldDecoderType.GAME_MODE_RULES, FieldDecoderFactory.GAME_MODE_RULES);
registry.set(FieldDecoderType.NO_SCALE, FieldDecoderFactory.NO_SCALE);
registry.set(FieldDecoderType.NORMAL_VECTOR, FieldDecoderFactory.NORMAL_VECTOR);
registry.set(FieldDecoderType.SIMULATION_TIME, FieldDecoderFactory.SIMULATION_TIME);
registry.set(FieldDecoderType.STRING, FieldDecoderFactory.STRING);
registry.set(FieldDecoderType.VAR_INT_32, FieldDecoderFactory.VAR_INT_32);
registry.set(FieldDecoderType.VAR_INT_64, FieldDecoderFactory.VAR_INT_64);
registry.set(FieldDecoderType.VAR_UINT_32, FieldDecoderFactory.VAR_UINT_32);
registry.set(FieldDecoderType.VAR_UINT_64, FieldDecoderFactory.VAR_UINT_64);

export default FieldDecoderCatalog;
