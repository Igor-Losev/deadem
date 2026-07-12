/** @import { TransformCallback } from 'node:stream' */

import Stream from 'node:stream';

class TransformNode extends Stream.Transform {
    /**
     * @constructor
     * @param {number} highWaterMark
     */
    constructor(highWaterMark) {
        super({ objectMode: true, highWaterMark });
    }

    /**
     * @protected
     */
    async _finalize() {

    }

    /**
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
     * @param {*} chunk
     * @returns {Promise<void>}
     */
    async _handle(chunk) {
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
