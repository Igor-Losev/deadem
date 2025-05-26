import assert from 'assert/strict';

import FieldDecoder from './FieldDecoder.js';

class FieldDecoderVectorN extends FieldDecoder {
    /**
     * @constructor
     * @param {FieldDecoder} decoder - Value decoder.
     * @param {number} n - Number of dimensions of the vector.
     */
    constructor(decoder, n) {
        super();

        assert(decoder instanceof FieldDecoder);
        assert(Number.isInteger(n) && n >= 2 && n <= 4);

        this._decoder = decoder;
        this._n = n;
    }

    /**
     * @protected
     * @param {BitBuffer} bitBuffer
     * @returns {number[]}
     */
    _decode(bitBuffer) {
        const vector = [ ];

        for (let i = 0; i < this._n; i++) {
            vector[i] = this._decoder.decode(bitBuffer);
        }

        return vector;
    }
}

export default FieldDecoderVectorN;
