'use strict';

const { Worker } = require('node:worker_threads'),
    path = require('path');

const DeferredPromise = require('./../data/DeferredPromise');

const WorkerParseTask = require('./WorkerParseTask'),
    WorkerThread = require('./WorkerThread');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('WorkerManager');

const WORKER_PATH = path.resolve(__dirname, './worker.js');

class WorkerManager {
    constructor(concurrency) {
        if (concurrency <= 0) {
            throw new Error(`Invalid concurrency argument [ ${concurrency} ]`);
        }

        this._concurrency = concurrency;

        this._counts = {
            tasks: 0,
            completed: 0
        };

        this._pending = [ ];

        this._threads = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_PATH);

            const thread = new WorkerThread(worker);

            this._threads.push(thread);

            logger.debug(`Starting worker [ ${worker.threadId} ]`);
        }
    }

    /**
     * @public
     * @returns {Promise<*>}
     */
    async ready() {
        if (this._getIsAvailable()) {
            return;
        }

        const deferred = new DeferredPromise();

        this._pending.push(deferred);

        return deferred.promise;
    }

    /**
     * @public
     * @param {WorkerParseTask} task
     * @returns {Promise<void>}
     */
    async run(task) {
        this._counts.tasks += 1;

        if (!this._getIsAvailable()) {
            throw new Error(`Unable to run task [ ${task.id} ]`);
        }

        const thread = this._threads.find(thread => !thread.busy);

        return thread.run(task)
            .then((result) => {
                this._releasePendingOnce();

                return result;
            }).catch((error) => {
                this._releasePendingOnce();

                return Promise.reject(error);
            });
    }

    /**
     * @public
     */
    terminate() {
        this._threads.forEach((thread) => {
            thread.worker.terminate();
        });

        this._threads = [ ];
    }

    /**
     * @private
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

        deferred.resolve();
    }
}

module.exports = WorkerManager;
