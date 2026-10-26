import Assert from '../Assert.js';

class TransformBrowser extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {number} highWaterMark
     */
    constructor(highWaterMark) {
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
        }, { highWaterMark }, { highWaterMark });

        /** @type {Array<*>} */
        this._bufferized = [ ];

        /** @type {TransformStreamDefaultController|null} */
        this._controller = null;
    }

    /**
     * @protected
     */
    _drainBufferized() {
        const controller = this._controller;

        Assert.exists(controller, 'Transform controller is not available');

        this._bufferized.forEach((chunk) => {
            controller.enqueue(chunk);
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
     * @param {*} _chunk
     * @returns {Promise<void>}
     */
    async _handle(_chunk) {
        throw new Error('TransformBrowser.handle() is not implemented');
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

export default TransformBrowser;
