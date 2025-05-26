import FieldDecoder from './FieldDecoder.js';

class FieldDecoderUVarInt32 extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number}
     */
    _decode(bitBuffer) {
        return bitBuffer.readUVarInt32();
    }
}

export default FieldDecoderUVarInt32;
