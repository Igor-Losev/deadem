'use strict';

class FieldDecoder {
    /**
     * @constructor
     * @abstract
     */
    constructor() {

    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     * @returns {*}
     */
    decode(bitBuffer) {
        return this._decode(bitBuffer);
    }

    /**
     * @protected
     * @returns {*}
     */
    _decode() {
        throw new Error('decode is not implemented');
    }
}

module.exports = FieldDecoder;
