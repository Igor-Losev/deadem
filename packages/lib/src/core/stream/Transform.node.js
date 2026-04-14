import Stream from 'node:stream';

class TransformNode extends Stream.Transform {
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
        try {
            await this._finalize();

            callback();
        } catch (error) {
            callback(error);
        }
    }

    /**
     * @protected
     * @abstract
     * @returns {void}
     */
    async _handle() {
        throw new Error('TransformNode.handle() is not implemented');
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
        try {
            await this._handle(chunk);

            callback();
        } catch (error) {
            callback(error);
        }
    }
}

export default TransformNode;
