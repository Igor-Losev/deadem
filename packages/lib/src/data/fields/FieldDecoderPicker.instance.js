import Assert from '#core/Assert.js';

import FieldDecoderFactory from './FieldDecoderFactory.js';

class FieldDecoderPicker {
    constructor() {
        const fieldDecoderFactory = new FieldDecoderFactory();

        /**
         * @typedef {(bitBuffer: BitBuffer) => *} Decoder
         * @typedef {(field: Field) => Decoder} Picker
         * @type {Map<string, Picker>}
         */
        this._pool = new Map();

        const retrieveBoolean = () => FieldDecoderFactory.BOOLEAN;
        const retrieveNoScale = () => FieldDecoderFactory.NO_SCALE;
        const retrieveString = () => FieldDecoderFactory.STRING;
        const retrieveVarInt32 = () => FieldDecoderFactory.VAR_INT_32;

        this._pool.set('bool', retrieveBoolean);
        this._pool.set('CBodyComponent', retrieveBoolean);
        this._pool.set('CPhysicsComponent', retrieveBoolean);
        this._pool.set('CRenderComponent', retrieveBoolean);

        this._pool.set('GameTime_t', retrieveNoScale);

        this._pool.set('char', retrieveString);
        this._pool.set('CUtlString', retrieveString);
        this._pool.set('CUtlSymbolLarge', retrieveString);

        this._pool.set('int8', retrieveVarInt32);
        this._pool.set('int16', retrieveVarInt32);
        this._pool.set('int32', retrieveVarInt32);

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
     * @param {String} code
     * @param {Field=} field
     * @returns {Decoder}
     */
    pick(code, field) {
        Assert.isTrue(typeof code === 'string');

        let decoder;

        if (this._pool.has(code)) {
            const retrieve = this._pool.get(code);

            decoder = retrieve(field);
        } else {
            decoder = FieldDecoderFactory.U_VAR_INT_32;
        }

        return decoder;
    }
}

export default FieldDecoderPicker.instance;
