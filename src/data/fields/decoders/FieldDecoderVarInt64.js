import FieldDecoder from './FieldDecoder.js';

class FieldDecoderVarInt64 extends FieldDecoder {
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
        return bitBuffer.readVarInt64();
    }
}

export default FieldDecoderVarInt64;
