import Stream from 'node:stream';

class TransformStreamNode extends Stream.Transform {
    constructor() {
        super({ objectMode: true });
    }

    /**
     * @protected
     */
    async _finalize() {

    }

    /**
     * @protected
     * @param {TransformCallback} callback
     * @returns {Promise<void>}
     */
    async _flush(callback) {
        await this._finalize();

        callback();
    }

    /**
     * @protected
     * @abstract
     * @returns {void}
     */
    async _handle() {
        throw new Error('TransformStreamNode.handle() is not implemented');
    }

    /**
     * @protected
     * @param {*} chunk
     */
    _push(chunk) {
        this.push(chunk);
    }

    /**
     * @protected
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(chunk, encoding, callback) {
        await this._handle(chunk);

        callback();
    }
}

export default TransformStreamNode;
