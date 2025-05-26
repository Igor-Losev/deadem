import snappy from 'snappyjs';

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

export default SnappyDecompressor.instance;
