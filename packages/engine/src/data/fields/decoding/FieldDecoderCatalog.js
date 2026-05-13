import Assert from '#core/Assert.js';

import FieldDecoderType from '#data/enums/FieldDecoderType.js';

import FieldDecoderFactory from '#data/fields/FieldDecoderFactory.js';
import FieldDecoderInstructions from '#data/fields/FieldDecoderInstructions.js';

import FieldDecoderDescriptor from './FieldDecoderDescriptor.js';

class FieldDecoderCatalog {
    /**
     * @constructor
     */
    constructor() {
        this._factory = new FieldDecoderFactory();
    }

    /**
     * @public
     * @param {FieldDecoderDescriptor} descriptor
     * @param {Field|null} [field=null]
     * @returns {Decoder}
     */
    resolve(descriptor, field = null) {
        Assert.isTrue(descriptor instanceof FieldDecoderDescriptor);

        const decoder = registry.get(descriptor.type) || null;

        if (decoder !== null) {
            return decoder;
        }

        switch (descriptor.type) {
            case FieldDecoderType.DYNAMIC_FLOAT_32:
                return this._factory.createFloat32(getDecoderInstructions(field));
            case FieldDecoderType.DYNAMIC_UINT_64:
                return this._factory.createUInt64(getDecoderInstructions(field));
            case FieldDecoderType.QANGLE:
                return this._factory.createQAngle(getDecoderInstructions(field));
            case FieldDecoderType.QUANTIZED_FLOAT:
                return this._factory.createQuantizedFloat(getDecoderInstructions(field));
            case FieldDecoderType.VECTOR:
                return this._factory.createVector(getDecoderInstructions(field), getVectorDimension(descriptor));
            default:
                throw new Error(`Unhandled field decoder type [ ${descriptor.type.code} ]`);
        }
    }
}

/**
 * @typedef {(bitBuffer: BitBuffer) => *} Decoder
 */

/**
 * @type {Map<FieldDecoderType, Decoder>}
 */
const registry = new Map();

registry.set(FieldDecoderType.BOOLEAN, FieldDecoderFactory.BOOLEAN);
registry.set(FieldDecoderType.COORDINATE, FieldDecoderFactory.COORDINATE);
registry.set(FieldDecoderType.FIXED_UINT_64, FieldDecoderFactory.U_INT_64);
registry.set(FieldDecoderType.NO_SCALE, FieldDecoderFactory.NO_SCALE);
registry.set(FieldDecoderType.NORMAL_VECTOR, FieldDecoderFactory.NORMAL_VECTOR);
registry.set(FieldDecoderType.SIMULATION_TIME, FieldDecoderFactory.SIMULATION_TIME);
registry.set(FieldDecoderType.STRING, FieldDecoderFactory.STRING);
registry.set(FieldDecoderType.VAR_INT_32, FieldDecoderFactory.VAR_INT_32);
registry.set(FieldDecoderType.VAR_INT_64, FieldDecoderFactory.VAR_INT_64);
registry.set(FieldDecoderType.VAR_UINT_32, FieldDecoderFactory.U_VAR_INT_32);
registry.set(FieldDecoderType.VAR_UINT_64, FieldDecoderFactory.U_VAR_INT_64);

function getDecoderInstructions(field) {
    Assert.isTrue(field !== null && field.decoderInstructions instanceof FieldDecoderInstructions);

    return field.decoderInstructions;
}

function getVectorDimension(descriptor) {
    const { dimension } = descriptor.options;

    Assert.isTrue(Number.isInteger(dimension) && dimension >= 2 && dimension <= 4);

    return dimension;
}

export default FieldDecoderCatalog;
