import FieldDecoder from './FieldDecoder.js';

class FieldDecoderComponent extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {0|1}
     */
    _decode(bitBuffer) {
        return bitBuffer.readBit();
    }
}

export default FieldDecoderComponent;
