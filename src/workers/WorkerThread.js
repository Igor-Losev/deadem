'use strict';

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const DeferredPromise = require('./../data/DeferredPromise');

const logger = LoggerProvider.getLogger('WorkerThread');

class WorkerThread {
    /**
     * @public
     * @constructor
     *
     * @param {Worker} worker
     */
    constructor(worker) {
        this._worker = worker;

        this._worker.on('message', (result) => {
            this._deferred.resolve(result);

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

    get worker() {
        return this._worker;
    }

    get busy() {
        return this._busy;
    }

    /**
     * @public
     * @param {WorkerParseTask} task
     */
    run(task) {
        if (this.busy) {
            throw new Error(`Unable to start task, thread [ ${this._worker.threadId} ] is busy`);
        }

        this._busy = true;

        this._deferred = new DeferredPromise();

        this._worker.postMessage(task);

        return this._deferred.promise;
    }
}

module.exports = WorkerThread;
