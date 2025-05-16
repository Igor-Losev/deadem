'use strict';

const DeferredPromise = require('./../data/DeferredPromise');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const WorkerRequestSerializer = require('./../workers/serializers/WorkerRequestSerializer.instance'),
    WorkerResponseSerializer = require('./../workers/serializers/WorkerResponseSerializer.instance');

const logger = LoggerProvider.getLogger('WorkerThread');

class WorkerThread {
    /**
     * @constructor
     * @param {Worker} worker
     */
    constructor(worker) {
        this._worker = worker;

        this._worker.on('message', (responseRaw) => {
            const response = WorkerResponseSerializer.deserialize(responseRaw);

            this._deferred.resolve(response);

            this._deferred = null;
            this._busy = false;
        });

        this._worker.on('error', (error) => {
            logger.error(`Thread [ ${this._worker.threadId} ]: `, error);

            this._deferred.reject(error);

            this._deferred = null;
            this._busy = false;
        });

        this._deferred = null;
        this._busy = false;
    }

    /**
     * @returns {Worker}
     */
    get worker() {
        return this._worker;
    }

    /**
     * @returns {boolean}
     */
    get busy() {
        return this._busy;
    }

    /**
     * @public
     * @param {WorkerRequest} request
     * @returns {Promise<*>}
     */
    send(request) {
        if (this._busy) {
            throw new Error(`Unable to send a message [ ${request.type.code} ], thread [ ${this._worker.threadId} ] is busy`);
        }

        this._busy = true;

        this._deferred = new DeferredPromise();

        this._worker.postMessage(WorkerRequestSerializer.serialize(request), request.transfers);

        return this._deferred.promise;
    }
}

module.exports = WorkerThread;
