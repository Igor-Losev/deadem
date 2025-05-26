import FieldDecoder from './FieldDecoder.js';

class FieldDecoderVarInt32 extends FieldDecoder {
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
        return bitBuffer.readVarInt32();
    }
}

export default FieldDecoderVarInt32;
