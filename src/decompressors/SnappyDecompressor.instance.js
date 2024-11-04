'use strict';

const snappy = require('snappy');

class SnappyDecompressor {
    constructor() {

    }

    /**
     * @public
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    decompress(buffer) {
        return snappy.uncompressSync(buffer);
    }

    static instance = new SnappyDecompressor();
}

module.exports = SnappyDecompressor.instance;
