import FieldDecoder from './FieldDecoder.js';

class FieldDecoderVectorNormal extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number[]}
     */
    _decode(bitBuffer) {
        return bitBuffer.readNormalVector();
    }
}

export default FieldDecoderVectorNormal;
