import Assert from '#core/Assert.js';

const registry = new Map();

class FieldDecoderType {
    /**
     * @constructor
     * @param {String} code
     */
    constructor(code) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(!registry.has(code), `Duplicated field decoder type [ ${code} ]`);

        this._code = code;

        registry.set(code, this);
    }

    /**
     * @public
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @static
     * @param {String} code
     * @returns {FieldDecoderType}
     */
    static parse(code) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);

        const type = registry.get(code) || null;

        if (type === null) {
            throw new Error(`Unknown field decoder type [ ${code} ]`);
        }

        return type;
    }

    static get BINARY_BLOCK() { return binaryBlock; }
    static get BOOLEAN() { return boolean; }
    static get COORDINATE() { return coordinate; }
    static get DYNAMIC_FLOAT_32() { return dynamicFloat32; }
    static get DYNAMIC_UINT_64() { return dynamicUint64; }
    static get FIXED_UINT_64() { return fixedUint64; }
    static get GAME_MODE_RULES() { return gameModeRules; }
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
    static get VECTOR() { return vector; }
}

const binaryBlock = new FieldDecoderType('BINARY_BLOCK');
const boolean = new FieldDecoderType('BOOLEAN');
const coordinate = new FieldDecoderType('COORDINATE');
const dynamicFloat32 = new FieldDecoderType('DYNAMIC_FLOAT_32');
const dynamicUint64 = new FieldDecoderType('DYNAMIC_UINT_64');
const fixedUint64 = new FieldDecoderType('FIXED_UINT_64');
const gameModeRules = new FieldDecoderType('GAME_MODE_RULES');
const noScale = new FieldDecoderType('NO_SCALE');
const normalVector = new FieldDecoderType('NORMAL_VECTOR');
const qAngle = new FieldDecoderType('QANGLE');
const quantizedFloat = new FieldDecoderType('QUANTIZED_FLOAT');
const simulationTime = new FieldDecoderType('SIMULATION_TIME');
const string = new FieldDecoderType('STRING');
const varInt32 = new FieldDecoderType('VAR_INT_32');
const varInt64 = new FieldDecoderType('VAR_INT_64');
const varUint32 = new FieldDecoderType('VAR_UINT_32');
const varUint64 = new FieldDecoderType('VAR_UINT_64');
const vector = new FieldDecoderType('VECTOR');

export default FieldDecoderType;
