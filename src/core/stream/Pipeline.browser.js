import WritableNoopStreamBrowser from '#core/stream/WritableNoopStream.browser.js';

class PipelineBrowser {
    /**
     * @public
     * @constructor
     * @param {ReadableStream} readable
     * @param {Array<TransformStreamBrowser>} transforms
     */
    constructor(readable, transforms) {
        const writeNoop = new WritableNoopStreamBrowser();

        transforms
            .reduce((p, t) => p.pipeThrough(t), readable)
            .pipeTo(writeNoop);

        this._writeNoop = writeNoop;
    }

    /**
     * @public
     * @returns {Promise<*>}
     */
    ready() {
        return this._writeNoop.ready();
    }
}

export default PipelineBrowser;
