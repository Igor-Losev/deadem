import FieldDecoder from './FieldDecoder.js';

class FieldDecoderBoolean extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {boolean}
     */
    _decode(bitBuffer) {
        return bitBuffer.readBit();
    }
}

export default FieldDecoderBoolean;
