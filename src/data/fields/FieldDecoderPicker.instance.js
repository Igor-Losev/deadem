'use strict';

const assert = require('assert/strict');

const FieldDecoderFactory = require('./FieldDecoderFactory');

const FieldDecoderBoolean = require('./decoders/FieldDecoderBoolean'),
    FieldDecoderNoScale = require('./decoders/FieldDecoderNoScale'),
    FieldDecoderString = require('./decoders/FieldDecoderString'),
    FieldDecoderUVarInt32 = require('./decoders/FieldDecoderUVarInt32'),
    FieldDecoderVarInt32 = require('./decoders/FieldDecoderVarInt32');

const decoderBoolean = new FieldDecoderBoolean();
const decoderNoScale = new FieldDecoderNoScale();
const decoderString = new FieldDecoderString();
const decoderUVarInt32 = new FieldDecoderUVarInt32();
const decoderVarInt32 = new FieldDecoderVarInt32();

class FieldDecoderPicker {
    constructor() {
        const fieldDecoderFactory = new FieldDecoderFactory();

        /** @type {Map<string, FieldDecoder|((Field) => FieldDecoder)>} */
        this._pool = new Map();

        this._pool.set('bool', decoderBoolean);
        this._pool.set('CBodyComponent', decoderBoolean);
        this._pool.set('CPhysicsComponent', decoderBoolean);
        this._pool.set('CRenderComponent', decoderBoolean);

        this._pool.set('GameTime_t', decoderNoScale);

        this._pool.set('char', decoderString);
        this._pool.set('CUtlString', decoderString);
        this._pool.set('CUtlSymbolLarge', decoderString);

        this._pool.set('int8', decoderVarInt32);
        this._pool.set('int16', decoderVarInt32);
        this._pool.set('int32', decoderVarInt32);

        this._pool.set('uint8', decoderUVarInt32);
        this._pool.set('uint16', decoderUVarInt32);
        this._pool.set('uint32', decoderUVarInt32);
        this._pool.set('CGameSceneNodeHandle', decoderUVarInt32);
        this._pool.set('CHandle', decoderUVarInt32);
        this._pool.set('Color', decoderUVarInt32);
        this._pool.set('CUtlStringToken', decoderUVarInt32);
        this._pool.set('HSequence', decoderUVarInt32);

        this._pool.set('float32', f => fieldDecoderFactory.createFloat32(f.decoderInstructions));

        this._pool.set('QAngle', f => fieldDecoderFactory.createQAngle(f.decoderInstructions));

        this._pool.set('CNetworkedQuantizedFloat', f => fieldDecoderFactory.createQuantizedFloat(f.decoderInstructions));

        this._pool.set('uint64', f => fieldDecoderFactory.createUInt64(f.decoderInstructions));
        this._pool.set('CStrongHandle', f => fieldDecoderFactory.createUInt64(f.decoderInstructions));

        this._pool.set('Vector2D', f => fieldDecoderFactory.createVector(f.decoderInstructions, 2));
        this._pool.set('Vector', f => fieldDecoderFactory.createVector(f.decoderInstructions, 3));
        this._pool.set('Vector4D', f => fieldDecoderFactory.createVector(f.decoderInstructions, 4));
    }

    static instance = new FieldDecoderPicker();

    /**
     * @public
     * @returns {FieldDecoderBoolean}
     */
    getBoolean() {
        return decoderBoolean;
    }

    /**
     * @public
     * @returns {FieldDecoderUVarInt32}
     */
    getUVarInt32() {
        return decoderUVarInt32;
    }

    /**
     * @public
     * @param {String} code
     * @param {Field=} field
     * @returns {FieldDecoder}
     */
    pick(code, field) {
        assert(typeof code === 'string');

        let decoder;

        if (this._pool.has(code)) {
            const decoderOrPicker = this._pool.get(code);

            if (typeof decoderOrPicker === 'function') {
                decoder = decoderOrPicker(field);
            } else {
                decoder = decoderOrPicker;
            }
        } else {
            decoder = decoderUVarInt32;
        }

        return decoder;
    }
}

module.exports = FieldDecoderPicker.instance;
