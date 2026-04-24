import WorkerThread from './WorkerThread.js';

/**
 * Represents a single worker thread in browser.
 */
class WorkerThreadBrowser extends WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker - The worker instance to wrap.
     * @param {number} localId - The local id.
     * @param {Logger} logger - Logger.
     */
    constructor(worker, localId, logger) {
        super(worker, localId, logger);

        worker.onmessage = (message) => {
            this._handleMessage(message.data);
        };

        worker.onerror = (error) => {
            this._handleError(error);
        };
    }

    /**
     * @protected
     * @param {WorkerRequest} request
     */
    _sendRequest(request) {
        this._worker.postMessage(request.serialize());
    }
}

export default WorkerThreadBrowser;
