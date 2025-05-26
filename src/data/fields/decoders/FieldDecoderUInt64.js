import FieldDecoder from './FieldDecoder.js';

class FieldDecoderUInt64 extends FieldDecoder {
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
        return bitBuffer.read(64).readBigUInt64LE();
    }
}

export default FieldDecoderUInt64;
