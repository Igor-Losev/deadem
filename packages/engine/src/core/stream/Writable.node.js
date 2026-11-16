import Stream from 'node:stream';

class WritableNode extends Stream.Writable {
    /**
     * @constructor
     * @param {number} highWaterMark
     */
    constructor(highWaterMark) {
        super({ objectMode: true, highWaterMark });
    }

    /**
     * @param {(error?: Error | null) => void} callback
     * @returns {Promise<void>}
     */
    async _final(callback) {
        try {
            await this._finalize();

            callback();
        } catch (error) {
            callback(/** @type {Error} */ (error));
        }
    }

    /**
     * @protected
     */
    async _finalize() {

    }

    /**
     * @protected
     * @abstract
     * @param {*} _chunk
     * @returns {Promise<void>}
     */
    async _handle(_chunk) {
        throw new Error('WritableNode.handle() is not implemented');
    }

    /**
     * @param {*} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null) => void} callback
     */
    async _write(chunk, encoding, callback) {
        try {
            await this._handle(chunk);

            callback();
        } catch (error) {
            callback(/** @type {Error} */ (error));
        }
    }
}

export default WritableNode;
