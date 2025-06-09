import DeferredPromise from '#data/DeferredPromise.js';

import WorkerMessageBridge from '#workers/WorkerMessageBridge.instance.js';

/**
 * Represents a single worker thread with request serialization,
 * response deserialization, and promise-based communication.
 */
class WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker - The worker instance to wrap.
     * @param {number} localId - The local id.
     * @param {Logger} logger - Logger.
     */
    constructor(worker, localId, logger) {
        this._worker = worker;
        this._logger = logger;

        this._localId = localId;
        this._systemId = worker.threadId;

        this._deferred = null;
        this._busy = false;
    }

    /**
     * The underlying worker instance.
     *
     * @returns {Worker}
     */
    get worker() {
        return this._worker;
    }

    /**
     * The local id (sequence).
     *
     * @returns {number}
     */
    get localId() {
        return this._localId;
    }

    /**
     * The system id (thread id).
     *
     * @returns {number}
     */
    get systemId() {
        return this._systemId;
    }

    /**
     * Indicates whether the worker is currently busy processing a request.
     *
     * @returns {boolean}
     */
    get busy() {
        return this._busy;
    }

    /**
     * Sends a request to the worker and returns a promise that resolves with the response.
     *
     * @public
     * @param {WorkerRequest} request - The request instance.
     * @returns {Promise<*>} - A promise that resolves with the response.
     */
    send(request) {
        if (this._busy) {
            throw new Error(`Unable to send a request [ ${request.constructor.name} ], thread [ ${this._localId} ] is busy`);
        }

        this._busy = true;

        this._deferred = new DeferredPromise();

        this._sendRequest(request);

        return this._deferred.promise;
    }

    /**
     * @protected
     * @param {WorkerResponse} responseRaw
     */
    _handleMessage(responseRaw) {
        const workerResponseClass = WorkerMessageBridge.resolveResponseClass(responseRaw);

        const response = workerResponseClass.deserialize(responseRaw.payload);

        const deferred = this._deferred;

        this._busy = false;
        this._deferred = null;

        deferred.resolve(response);
    }

    /**
     * @protected
     * @param {Error} error
     */
    _handleError(error) {
        this._logger.error(`Thread [ ${this._localId} ]: `, error);

        const deferred = this._deferred;

        this._deferred = null;
        this._busy = false;

        deferred.reject(error);
    }

    /**
     * @protected
     */
    _sendRequest() {
        throw new Error('WorkerThread._sendRequest not implemented()');
    }
}

export default WorkerThread;
