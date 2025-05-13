'use strict';

const assert = require('assert');

const FieldDecoder = require('./FieldDecoder'),
    FieldDecoderQuantizedFloat = require('./FieldDecoderQuantizedFloat');

const registry = new Map();

class FieldDecoderStrategy {
    /**
     * @public
     * @constructor
     * @param {String} code
     * @param {(Field) => FieldDecoder} decoderPicker
     */
    constructor(code, decoderPicker) {
        assert(typeof code === 'string');
        assert(typeof decoderPicker === 'function');

        this._code = code;
        this._decoderPicker = decoderPicker;

        registry.set(code, this);
    }

    /**
     * @static
     * @param {String} code
     * @returns {FieldDecoderStrategy|null}
     */
    static parse(code) {
        return registry.get(code) || uint32;
    }

    /**
     * @public
     * @param {Field} field
     * @returns {FieldDecoder}
     */
    pick(field) {
        return this._decoderPicker(field);
    }

    static get FLOAT_32() { return float32; };
}

const CBodyComponent = new FieldDecoderStrategy('CBodyComponent', f => FieldDecoder.COMPONENT);
const CGameSceneNodeHandle = new FieldDecoderStrategy('CGameSceneNodeHandle', f => FieldDecoder.UINT_32);
const CHandle = new FieldDecoderStrategy('CHandle', f => FieldDecoder.UINT_32);
const CNetworkedQuantizedFloat = new FieldDecoderStrategy('CNetworkedQuantizedFloat', (f) => {
    const decoder = FieldDecoderQuantizedFloat.fromInstructions(f.decoderInstructions);

    return FieldDecoder.delegate('QuantizedFloat', (bitBuffer) => {
        return decoder.decode(bitBuffer);
    });
});
const Color = new FieldDecoderStrategy('Color', f => FieldDecoder.UINT_32);
const CPhysicsComponent = new FieldDecoderStrategy('CPhysicsComponent', f => FieldDecoder.COMPONENT);
const CRenderComponent = new FieldDecoderStrategy('CRenderComponent', f => FieldDecoder.COMPONENT);
const CStrongHandle = new FieldDecoderStrategy('CStrongHandle', getDecoderForUnsignedInt64());
const CUtlString = new FieldDecoderStrategy('CUtlString', f => FieldDecoder.STRING);
const CUtlStringToken = new FieldDecoderStrategy('CUtlStringToken', f => FieldDecoder.UINT_32);
const CUtlSymbolLarge = new FieldDecoderStrategy('CUtlSymbolLarge', f => FieldDecoder.STRING);
const GameTime_t = new FieldDecoderStrategy('GameTime_t', f => FieldDecoder.NOSCALE);
const HSequence = new FieldDecoderStrategy('HSequence', f => FieldDecoder.UINT_32);
const QAngle = new FieldDecoderStrategy('QAngle', f => {
    return FieldDecoder.delegate('QAngle', (bitBuffer) => {
        if (f.decoderInstructions.encoder === 'qangle_pitch_yaw') {
            const bits = f.decoderInstructions.bitCount;

            return [ bitBuffer.readAngle(bits), bitBuffer.readAngle(bits), 0 ];
        }

        if (f.decoderInstructions.bitCount !== null && f.decoderInstructions.bitCount !== 0) {
            const bits = f.decoderInstructions.bitCount;

            return [ bitBuffer.readAngle(bits), bitBuffer.readAngle(bits), bitBuffer.readAngle(bits) ];
        }

        const hasX = bitBuffer.readBit() === 1;
        const hasY = bitBuffer.readBit() === 1;
        const hasZ = bitBuffer.readBit() === 1;

        const isPrecise = f.decoderInstructions.encoder === 'qangle_precise';

        const readCoord = () => isPrecise
            ? bitBuffer.readCoordPrecise()
            : bitBuffer.readCoord();

        const value = [ 0, 0, 0 ];

        if (hasX) {
            value[0] = readCoord();
        }

        if (hasY) {
            value[1] = readCoord();
        }

        if (hasZ) {
            value[2] = readCoord();
        }

        return value;
    });
});

const Vector2D = new FieldDecoderStrategy('Vector2D', getDecoderPickerForVector(2));
const Vector = new FieldDecoderStrategy('Vector', getDecoderPickerForVector(3));
const Vector4D = new FieldDecoderStrategy('Vector4D', getDecoderPickerForVector(4));

const bool = new FieldDecoderStrategy('bool', f => FieldDecoder.BOOLEAN);
const char = new FieldDecoderStrategy('char', f => FieldDecoder.STRING);
const float32 = new FieldDecoderStrategy('float32', (f) => {
    switch (f.decoderInstructions.encoder) {
        case 'coord':
            return FieldDecoder.COORD;
        case 'runetime':
            return FieldDecoder.RUNE_TIME;
        case 'simtime':
            return FieldDecoder.SIMULATION_TIME;
        default:
            break;
    }

    if (f.decoderInstructions.bitCount === null || f.decoderInstructions.bitCount <= 0 || f.decoderInstructions.bitCount >= 32) {
        return FieldDecoder.NOSCALE;
    }

    const decoder = FieldDecoderQuantizedFloat.fromInstructions(f.decoderInstructions);

    return FieldDecoder.delegate('QuantizedFloat', (bitBuffer) => {
        return decoder.decode(bitBuffer);
    });
});
const float64 = new FieldDecoderStrategy('float64', f => {
    throw new Error('Unable to decode float64');
});

const int8 = new FieldDecoderStrategy('int8', f => FieldDecoder.INT_32);
const int16 = new FieldDecoderStrategy('int16', f => FieldDecoder.INT_32);
const int32 = new FieldDecoderStrategy('int32', f => FieldDecoder.INT_32);

const uint8 = new FieldDecoderStrategy('uint8', f => FieldDecoder.UINT_32);
const uint16 = new FieldDecoderStrategy('uint16', f => FieldDecoder.UINT_32);
const uint32 = new FieldDecoderStrategy('uint32', f => FieldDecoder.UINT_32);
const uint64 = new FieldDecoderStrategy('uint64', getDecoderForUnsignedInt64());

/**
 * @param {number} dimension
 * @returns {function(Field): FieldDecoder}
 */
function getDecoderPickerForVector(dimension) {
    assert(Number.isInteger(dimension));

    return (f) => {
        if (dimension === 3 && f.decoderInstructions.encoder === 'normal') {
            return FieldDecoder.VECTOR;
        }

        const decoder = FieldDecoderStrategy.FLOAT_32.pick(f);

        return FieldDecoder.delegate(`VECTOR_${dimension}D`, (bitBuffer) => {
            const vector = [ ];

            for (let i = 0; i < dimension; i++) {
                vector[i] = decoder.decode(bitBuffer);
            }

            return vector;
        });
    };
}

/**
 * @returns {function(Field): FieldDecoder}
 */
function getDecoderForUnsignedInt64() {
    return (f) => {
        switch (f.decoderInstructions.encoder) {
            case 'fixed64':
                return FieldDecoder.delegate('UINT_64_FIXED', (bitBuffer) => bitBuffer.read(64).readBigUint64LE());
            default:
                return FieldDecoder.UINT_64;
        }
    }
}

module.exports = FieldDecoderStrategy;
