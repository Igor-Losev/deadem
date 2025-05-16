'use strict';

const { Worker } = require('worker_threads'),
    path = require('path');

const DeferredPromise = require('./../data/DeferredPromise');

const WorkerThread = require('./WorkerThread');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('WorkerManager');

const WORKER_PATH = path.resolve(__dirname, './scripts/worker.js');

class WorkerManager {
    constructor(concurrency) {
        if (concurrency <= 0) {
            throw new Error(`Invalid concurrency argument [ ${concurrency} ]`);
        }

        this._concurrency = concurrency;

        this._counts = {
            completed: 0,
            request: 0
        };

        this._pending = [ ];

        this._threads = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_PATH);

            const thread = new WorkerThread(worker);

            this._threads.push(thread);

            logger.info(`Starting worker [ ${worker.threadId} ]`);
        }
    }

    get concurrency() {
        return this._concurrency;
    }

    /**
     * @public
     * @returns {Promise<WorkerThread>}
     */
    async requestThread() {
        const thread = this._threads.find(thread => !thread.busy) || null;

        if (thread !== null) {
            return thread;
        }

        const deferred = new DeferredPromise();

        this._pending.push(deferred);

        return deferred.promise;
    }

    /**
     * @public
     * @param {WorkerThread} thread
     * @param {WorkerRequest} request
     * @returns {Promise<*>}
     */
    async process(thread, request) {
        this._counts.request += 1;

        if (!this._getIsAvailable()) {
            throw new Error(`Unable to send request [ ${request.type.code} ]. All threads are busy`);
        }

        return thread.send(request)
            .then((result) => {
                this._releasePendingOnce();

                return result;
            }).catch((error) => {
                this._releasePendingOnce();

                throw error;
            });
    }

    /**
     * @public
     */
    terminate() {
        this._threads.forEach((thread, index) => {
            thread.worker.terminate();

            logger.info(`Terminated Worker [ ${thread.worker.threadId} ]`);
        });

        this._threads = [ ];
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _getIsAvailable() {
        return this._threads.some(thread => !thread.busy);
    }

    /**
     * @private
     */
    _releasePendingOnce() {
        if (this._pending.length === 0) {
            return;
        }

        const deferred = this._pending.shift();

        const thread = this._threads.find(thread => !thread.busy) || null;

        deferred.resolve(thread);
    }
}

module.exports = WorkerManager;
