import snappy from 'snappyjs';

class Snappy {
    constructor() {

    }

    static instance = new Snappy();

    /**
     * @public
     * @param {Uint8Array} buffer
     * @returns {Uint8Array}
     */
    compress(buffer) {
        return snappy.compress(buffer);
    }

    /**
     * @public
     * @param {Uint8Array} buffer
     * @returns {Uint8Array}
     */
    decompress(buffer) {
        return snappy.uncompress(buffer);
    }
}

export default Snappy.instance;
