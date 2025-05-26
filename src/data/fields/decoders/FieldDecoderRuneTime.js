import FieldDecoder from './FieldDecoder.js';

class FieldDecoderRuneTime extends FieldDecoder {
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
        return bitBuffer.read(4).readUInt8();
    }
}

export default FieldDecoderRuneTime;
