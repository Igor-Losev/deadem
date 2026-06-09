import Assert from '#core/Assert.js';

import FieldDecoderType from '#data/enums/FieldDecoderType.js';

import FieldDecoder from './FieldDecoder.js';
import FieldDecoderDescriptor from './FieldDecoderDescriptor.js';
import FieldDecoderFactory from './FieldDecoderFactory.js';
import FieldDecoderInstructions from './FieldDecoderInstructions.js';
import FieldStorageDescriptor from './FieldStorageDescriptor.js';

class FieldDecoderCatalog {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._factory = new FieldDecoderFactory();
    }

    /**
     * Resolves a decoder.
     *
     * @public
     * @param {FieldDecoderDescriptor} descriptor
     * @param {FieldDecoderInstructions} decoderInstructions
     * @returns {FieldDecoder}
     */
    resolve(descriptor, decoderInstructions) {
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);
        Assert.isTrue(decoderInstructions instanceof FieldDecoderInstructions);

        const resolved = registry.get(descriptor.type) || null;

        if (resolved !== null) {
            return resolved;
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
 * @type {Map<FieldDecoderType, FieldDecoder>}
 */
const registry = new Map();

registry.set(FieldDecoderType.BINARY_BLOCK, new FieldDecoder(FieldDecoderFactory.BINARY_BLOCK, FieldStorageDescriptor.MISC));
registry.set(FieldDecoderType.BOOLEAN, new FieldDecoder(FieldDecoderFactory.BOOLEAN, FieldStorageDescriptor.INT_BOOL));
registry.set(FieldDecoderType.COORDINATE, new FieldDecoder(FieldDecoderFactory.COORDINATE, FieldStorageDescriptor.FLOAT));
registry.set(FieldDecoderType.FIXED_UINT_64, new FieldDecoder(FieldDecoderFactory.FIXED_UINT_64, FieldStorageDescriptor.MISC));
registry.set(FieldDecoderType.GAME_MODE_RULES, new FieldDecoder(FieldDecoderFactory.GAME_MODE_RULES, FieldStorageDescriptor.INT_BOOL));
registry.set(FieldDecoderType.NO_SCALE, new FieldDecoder(FieldDecoderFactory.NO_SCALE, FieldStorageDescriptor.FLOAT));
registry.set(FieldDecoderType.NORMAL_VECTOR, new FieldDecoder(FieldDecoderFactory.NORMAL_VECTOR, FieldStorageDescriptor.createVector(3)));
registry.set(FieldDecoderType.SIMULATION_TIME, new FieldDecoder(FieldDecoderFactory.SIMULATION_TIME, FieldStorageDescriptor.INT_UNSIGNED));
registry.set(FieldDecoderType.STRING, new FieldDecoder(FieldDecoderFactory.STRING, FieldStorageDescriptor.MISC));
registry.set(FieldDecoderType.VAR_INT_32, new FieldDecoder(FieldDecoderFactory.VAR_INT_32, FieldStorageDescriptor.INT_SIGNED));
registry.set(FieldDecoderType.VAR_INT_64, new FieldDecoder(FieldDecoderFactory.VAR_INT_64, FieldStorageDescriptor.MISC));
registry.set(FieldDecoderType.VAR_UINT_32, new FieldDecoder(FieldDecoderFactory.VAR_UINT_32, FieldStorageDescriptor.INT_UNSIGNED));
registry.set(FieldDecoderType.VAR_UINT_64, new FieldDecoder(FieldDecoderFactory.VAR_UINT_64, FieldStorageDescriptor.MISC));

export default FieldDecoderCatalog;
