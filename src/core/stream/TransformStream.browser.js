class TransformStreamBrowser extends TransformStream {
    constructor() {
        super({
            flush: async (controller) => {
                this._controller = controller;

                this._drainBufferized();

                await this._finalize();

                this._controller = null;
            },
            transform: async (chunk, controller) => {
                this._controller = controller;

                this._drainBufferized();

                await this._handle(chunk);

                this._controller = null;
            }
        });

        this._bufferized = [ ];
        this._controller = null;
    }

    /**
     * @protected
     */
    _drainBufferized() {
        this._bufferized.forEach((chunk) => {
            this._controller.enqueue(chunk);
        });

        this._bufferized = [ ];
    }

    /**
     * @protected
     */
    async _finalize() {

    }

    /**
     * @protected
     * @abstract
     */
    async _handle() {
        throw new Error('TransformStreamBrowser.handle() is not implemented');
    }

    /**
     * @protected
     * @param {*} chunk
     */
    _push(chunk) {
        if (this._controller !== null) {
            this._controller.enqueue(chunk);
        } else {
            this._bufferized.push(chunk);
        }
    }
}

export default TransformStreamBrowser;
