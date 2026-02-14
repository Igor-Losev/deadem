import snappy from 'snappyjs';

class SnappyDecompressor {
    constructor() {

    }

    /**
     * @public
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer|Uint8Array}
     */
    decompress(buffer) {
        return snappy.uncompress(buffer);
    }

    static instance = new SnappyDecompressor();
}

export default SnappyDecompressor.instance;
