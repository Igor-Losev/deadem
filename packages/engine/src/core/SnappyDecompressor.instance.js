import snappy from 'snappyjs';

class SnappyDecompressor {
    constructor() {

    }

    /**
     * @public
     * @param {Uint8Array} buffer
     * @returns {Uint8Array}
     */
    decompress(buffer) {
        return snappy.uncompress(buffer);
    }

    static instance = new SnappyDecompressor();
}

export default SnappyDecompressor.instance;
