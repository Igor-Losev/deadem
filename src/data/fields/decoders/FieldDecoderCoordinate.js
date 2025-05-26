import FieldDecoder from './FieldDecoder.js';

class FieldDecoderCoordinate extends FieldDecoder {
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
        return bitBuffer.readCoordinate();
    }
}

export default FieldDecoderCoordinate;
