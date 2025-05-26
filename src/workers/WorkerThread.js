import DeferredPromise from './../data/DeferredPromise.js';

import WorkerRequestSerializer from './../workers/serializers/WorkerRequestSerializer.instance.js';
import WorkerResponseSerializer from './../workers/serializers/WorkerResponseSerializer.instance.js';

/**
 * Represents a single worker thread with request serialization,
 * response deserialization, and promise-based communication.
 */
class WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker - The worker instance to wrap.
     * @param {Logger} logger - Logger.
     */
    constructor(worker, logger) {
        this._worker = worker;
        this._logger = logger;

        this._worker.on('message', (responseRaw) => {
            const response = WorkerResponseSerializer.deserialize(responseRaw);

            this._logger.trace(`Response received [ ${response.type.code} ] from thread [ ${this.getId()} ]`);

            const deferred = this._deferred;

            this._busy = false;
            this._deferred = null;

            deferred.resolve(response);
        });

        this._worker.on('error', (error) => {
            this._logger.error(`Thread [ ${this.getId()} ]: `, error);

            const deferred = this._deferred;

            this._deferred = null;
            this._busy = false;

            deferred.reject(error);
        });

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
     * Indicates whether the worker is currently busy processing a request.
     *
     * @returns {boolean}
     */
    get busy() {
        return this._busy;
    }

    /**
     * Gets the unique thread ID of the worker.
     *
     * @public
     * @returns {number}
     */
    getId() {
        return this._worker.threadId;
    }

    /**
     * Sends a request to the worker and returns a promise that resolves with the response.
     *
     * @public
     * @param {WorkerRequest} request - The request instance.
     * @returns {Promise<*>} - A promise that resolves with the response.
     */
    send(request) {
        this._logger.trace(`Sending a request [ ${request.type.code} ] to thread [ ${this.getId()} ]`);

        if (this._busy) {
            throw new Error(`Unable to send a request [ ${request.type.code} ], thread [ ${this.getId()} ] is busy`);
        }

        this._busy = true;

        this._deferred = new DeferredPromise();

        this._worker.postMessage(WorkerRequestSerializer.serialize(request), request.transfers);

        return this._deferred.promise;
    }
}

export default WorkerThread;
