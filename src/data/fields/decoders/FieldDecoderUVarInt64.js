import FieldDecoder from './FieldDecoder.js';

class FieldDecoderUVarInt64 extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {BigInt}
     */
    _decode(bitBuffer) {
        return bitBuffer.readUVarInt64();
    }
}

export default FieldDecoderUVarInt64;
