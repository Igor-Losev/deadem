import Stream from 'node:stream';

class WritableSinkStreamNode extends Stream.Writable {
    /**
     * @public
     * @constructor
     * @param {(function(*): void)|null} [onWrite=null] - Optional callback invoked for each chunk.
     */
    constructor(onWrite = null) {
        super({ objectMode: true });

        this._onWrite = onWrite;
    }

    /**
     * @overload
     * @param {*} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null) => void} callback
     */
    _write(chunk, encoding, callback) {
        if (this._onWrite !== null) {
            this._onWrite(chunk);
        }

        callback();
    }
}

export default WritableSinkStreamNode;
