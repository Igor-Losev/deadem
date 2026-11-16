import WritableSink from '#core/stream/WritableSink.js';

/** @typedef {{ pipe: Function, destroy: Function }} NodeReadable */

class PipelineBrowser {
    /**
     * @public
     * @constructor
     * @param {ReadableStream} readable
     * @param {Array<TransformStream>} transforms
     * @param {WritableStream|null} [writable=null]
     */
    constructor(readable, transforms, writable = null) {
        const abortController = new AbortController();

        const destination = writable !== null ? writable : new WritableSink();

        this._promise = transforms
            .reduce((p, t) => p.pipeThrough(t), readable)
            .pipeTo(destination, { signal: abortController.signal });

        this._abortController = abortController;
        /** @type {ReadableStream & { destroy?: () => void }} */
        this._readable = readable;
    }

    /**
     * Returns whether the pipeline was rejected because it was aborted.
     *
     * @public
     * @static
     * @param {*} error
     * @returns {boolean}
     */
    static getIsAbortError(error) {
        return error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.name === 'AbortError';
    }

    /**
     * @public
     * @returns {boolean}
     */
    get aborted() {
        return this._abortController.signal.aborted;
    }

    /**
     * @public
     */
    abort() {
        this._abortController.abort();

        if (typeof this._readable.destroy === 'function') {
            this._readable.destroy();
        }
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    ready() {
        return this._promise;
    }
}

export default PipelineBrowser;
