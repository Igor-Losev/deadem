import Stream from 'node:stream';

class WritableNoopStreamNode extends Stream.Writable {
    constructor() {
        super({ objectMode: true });
    }

    /**
     * @protected
     * @param {*} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error | null) => void} callback
     */
    _write(chunk, encoding, callback) {
        callback();
    }
}

export default WritableNoopStreamNode;
