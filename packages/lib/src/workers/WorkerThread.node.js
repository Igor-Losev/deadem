import WorkerThread from './WorkerThread.js';

/**
 * Represents a single worker thread in node.js.
 */
class WorkerThreadNode extends WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker - The worker instance to wrap.
     * @param {number} localId - The local id.
     * @param {Logger} logger - Logger.
     */
    constructor(worker, localId, logger) {
        super(worker, localId, logger);

        this._worker.on('message', (responseRaw) => {
            this._handleMessage(responseRaw);
        });

        this._worker.on('error', (error) => {
            this._handleError(error);
        });
    }

    /**
     * @protected
     * @param {WorkerRequest} request
     */
    _sendRequest(request) {
        this._worker.postMessage(request.serialize(), request.transfers);
    }
}

export default WorkerThreadNode;
