import FieldDecoder from './FieldDecoder.js';

class FieldDecoderString extends FieldDecoder {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {string}
     */
    _decode(bitBuffer) {
        return bitBuffer.readString();
    }
}

export default FieldDecoderString;
