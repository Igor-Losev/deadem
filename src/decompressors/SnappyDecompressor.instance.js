'use strict';

const snappy = require('snappyjs');

class SnappyDecompressor {
    constructor() {

    }

    /**
     * @public
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    decompress(buffer) {
        return snappy.uncompress(buffer);
    }

    static instance = new SnappyDecompressor();
}

module.exports = SnappyDecompressor.instance;
