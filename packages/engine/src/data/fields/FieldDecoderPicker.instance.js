import Assert from '#core/Assert.js';

import FieldDecoderFactory from './FieldDecoderFactory.js';

class FieldDecoderPicker {
    constructor() {
        const fieldDecoderFactory = new FieldDecoderFactory();

        /**
         * @typedef {(bitBuffer: BitBuffer) => *} Decoder
         * @typedef {(decoderInstructions: FieldDecoderInstructions) => Decoder} Picker
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

        this._pool.set('HeroID_t', retrieveVarInt32);
        this._pool.set('int8', retrieveVarInt32);
        this._pool.set('int16', retrieveVarInt32);
        this._pool.set('int32', retrieveVarInt32);

        this._pool.set('float32', i => fieldDecoderFactory.createFloat32(i));

        this._pool.set('QAngle', i => fieldDecoderFactory.createQAngle(i));

        this._pool.set('CNetworkedQuantizedFloat', i => fieldDecoderFactory.createQuantizedFloat(i));

        this._pool.set('uint64', i => fieldDecoderFactory.createUInt64(i));
        this._pool.set('CStrongHandle', i => fieldDecoderFactory.createUInt64(i));
        this._pool.set('HeroFacetKey_t', i => fieldDecoderFactory.createUInt64(i));
        this._pool.set('ResourceId_t', i => fieldDecoderFactory.createUInt64(i));

        this._pool.set('Vector2D', i => fieldDecoderFactory.createVector(i, 2));
        this._pool.set('Vector', i => fieldDecoderFactory.createVector(i, 3));
        this._pool.set('VectorWS', i => fieldDecoderFactory.createVector(i, 3));
        this._pool.set('Vector4D', i => fieldDecoderFactory.createVector(i, 4));
    }

    static instance = new FieldDecoderPicker();

    /**
     * @public
     * @param {String} code
     * @param {FieldDecoderInstructions} decoderInstructions
     * @returns {Decoder}
     */
    pick(code, decoderInstructions) {
        Assert.isTrue(typeof code === 'string');

        let decoder;

        if (this._pool.has(code)) {
            const retrieve = this._pool.get(code);

            decoder = retrieve(decoderInstructions);
        } else {
            decoder = FieldDecoderFactory.U_VAR_INT_32;
        }

        return decoder;
    }
}

export default FieldDecoderPicker.instance;
