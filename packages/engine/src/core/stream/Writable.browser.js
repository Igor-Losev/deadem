class WritableBrowser extends WritableStream {
    /**
     * @public
     * @constructor
     * @param {number} highWaterMark
     */
    constructor(highWaterMark) {
        super({
            close: async () => {
                await this._finalize();
            },
            write: async (chunk) => {
                await this._handle(chunk);
            }
        }, { highWaterMark });
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
        throw new Error('WritableBrowser.handle() is not implemented');
    }
}

export default WritableBrowser;
