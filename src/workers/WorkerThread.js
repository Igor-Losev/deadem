'use strict';

const DeferredPromise = require('./../data/DeferredPromise');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const WorkerRequestSerializer = require('./../workers/serializers/WorkerRequestSerializer.instance'),
    WorkerResponseSerializer = require('./../workers/serializers/WorkerResponseSerializer.instance');

const logger = LoggerProvider.getLogger('WorkerThread');

/**
 * Represents a single worker thread with request serialization,
 * response deserialization, and promise-based communication.
 */
class WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker - The worker instance to wrap.
     */
    constructor(worker) {
        this._worker = worker;

        this._worker.on('message', (responseRaw) => {
            const response = WorkerResponseSerializer.deserialize(responseRaw);

            logger.debug(`Response received [ ${response.type.code} ] from thread [ ${this.getId()} ]`);

            const deferred = this._deferred;

            this._busy = false;
            this._deferred = null;

            deferred.resolve(response);
        });

        this._worker.on('error', (error) => {
            logger.error(`Thread [ ${this.getId()} ]: `, error);

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
     * @returns {Number}
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
        logger.debug(`Sending a request [ ${request.type.code} ] to thread [ ${this.getId()} ]`);

        if (this._busy) {
            throw new Error(`Unable to send a request [ ${request.type.code} ], thread [ ${this.getId()} ] is busy`);
        }

        this._busy = true;

        this._deferred = new DeferredPromise();

        this._worker.postMessage(WorkerRequestSerializer.serialize(request), request.transfers);

        return this._deferred.promise;
    }
}

module.exports = WorkerThread;
