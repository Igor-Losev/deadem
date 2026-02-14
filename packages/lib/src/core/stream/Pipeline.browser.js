import WritableSinkStream from '#core/stream/WritableSinkStream.js';

class PipelineBrowser {
    /**
     * @public
     * @constructor
     * @param {ReadableStream} readable
     * @param {Array<TransformStreamBrowser>} transforms
     * @param {WritableStream|null} [writable=null]
     */
    constructor(readable, transforms, writable = null) {
        const abortController = new AbortController();

        const destination = writable !== null ? writable : new WritableSinkStream();

        this._promise = transforms
            .reduce((p, t) => p.pipeThrough(t), readable)
            .pipeTo(destination, { signal: abortController.signal });

        this._abortController = abortController;
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
