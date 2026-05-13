import Assert from '#core/Assert.js';

import FieldDecoderType from '#data/enums/FieldDecoderType.js';

class FieldDecoderDescriptor {
    /**
     * @constructor
     * @param {FieldDecoderType} type
     * @param {Object} [options={}]
     */
    constructor(type, options = {}) {
        Assert.isTrue(type instanceof FieldDecoderType);
        Assert.isTrue(options !== null && typeof options === 'object' && !Array.isArray(options));

        this._type = type;
        this._options = options;
    }

    /**
     * @public
     * @returns {FieldDecoderType}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {Object}
     */
    get options() {
        return this._options;
    }

    /**
     * @public
     * @returns {{type: String, options: Object}}
     */
    export() {
        return {
            type: this._type.code,
            options: this._options
        };
    }

    /**
     * @public
     * @static
     * @param {number} dimension
     * @returns {FieldDecoderDescriptor}
     */
    static createVector(dimension) {
        Assert.isTrue(Number.isInteger(dimension) && dimension >= 2 && dimension <= 4);

        return new FieldDecoderDescriptor(FieldDecoderType.VECTOR, { dimension });
    }

    /**
     * @public
     * @static
     * @param {{type: String, options: Object}} data
     * @returns {FieldDecoderDescriptor}
     */
    static reconstruct(data) {
        Assert.isTrue(data !== null && typeof data === 'object');

        return new FieldDecoderDescriptor(FieldDecoderType.parse(data.type), data.options || {});
    }

    static get BOOLEAN() { return boolean; }
    static get COORDINATE() { return coordinate; }
    static get DYNAMIC_FLOAT_32() { return dynamicFloat32; }
    static get DYNAMIC_UINT_64() { return dynamicUint64; }
    static get FIXED_UINT_64() { return fixedUint64; }
    static get NO_SCALE() { return noScale; }
    static get NORMAL_VECTOR() { return normalVector; }
    static get QANGLE() { return qAngle; }
    static get QUANTIZED_FLOAT() { return quantizedFloat; }
    static get SIMULATION_TIME() { return simulationTime; }
    static get STRING() { return string; }
    static get VAR_INT_32() { return varInt32; }
    static get VAR_INT_64() { return varInt64; }
    static get VAR_UINT_32() { return varUint32; }
    static get VAR_UINT_64() { return varUint64; }
}

const boolean = new FieldDecoderDescriptor(FieldDecoderType.BOOLEAN);
const coordinate = new FieldDecoderDescriptor(FieldDecoderType.COORDINATE);
const dynamicFloat32 = new FieldDecoderDescriptor(FieldDecoderType.DYNAMIC_FLOAT_32);
const dynamicUint64 = new FieldDecoderDescriptor(FieldDecoderType.DYNAMIC_UINT_64);
const fixedUint64 = new FieldDecoderDescriptor(FieldDecoderType.FIXED_UINT_64);
const noScale = new FieldDecoderDescriptor(FieldDecoderType.NO_SCALE);
const normalVector = new FieldDecoderDescriptor(FieldDecoderType.NORMAL_VECTOR);
const qAngle = new FieldDecoderDescriptor(FieldDecoderType.QANGLE);
const quantizedFloat = new FieldDecoderDescriptor(FieldDecoderType.QUANTIZED_FLOAT);
const simulationTime = new FieldDecoderDescriptor(FieldDecoderType.SIMULATION_TIME);
const string = new FieldDecoderDescriptor(FieldDecoderType.STRING);
const varInt32 = new FieldDecoderDescriptor(FieldDecoderType.VAR_INT_32);
const varInt64 = new FieldDecoderDescriptor(FieldDecoderType.VAR_INT_64);
const varUint32 = new FieldDecoderDescriptor(FieldDecoderType.VAR_UINT_32);
const varUint64 = new FieldDecoderDescriptor(FieldDecoderType.VAR_UINT_64);

export default FieldDecoderDescriptor;
