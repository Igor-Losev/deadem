import Stream from 'node:stream';

class WritableSinkNode extends Stream.Writable {
    /**
     * @public
     * @constructor
     * @param {((chunk: *) => *)|null} [onWrite=null] - Optional callback invoked for each chunk. A returned promise is awaited.
     */
    constructor(onWrite = null) {
        super({ objectMode: true });

        /** @private */
        this._onWrite = onWrite;
    }

    /**
     * @param {*} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null) => void} callback
     */
    _write(chunk, encoding, callback) {
        const result = this._onWrite !== null ? this._onWrite(chunk) : undefined;

        if (result instanceof Promise) {
            result.then(() => callback(), callback);

            return;
        }

        callback();
    }
}

export default WritableSinkNode;
