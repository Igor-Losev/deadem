'use strict';

const assert = require('assert/strict'),
    { Worker } = require('worker_threads'),
    path = require('path');

const DeferredPromise = require('./../data/DeferredPromise');

const WorkerThread = require('./WorkerThread');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('WorkerManager');

const WORKER_PATH = path.resolve(__dirname, './scripts/worker.js');

/**
 * Manages a pool of {@link WorkerThread} instances with fixed concurrency.
 */
class WorkerManager {
    /**
     * @constructor
     * @param {number} concurrency - Number of worker threads to manage.
     */
    constructor(concurrency) {
        if (concurrency <= 0) {
            throw new Error(`Invalid concurrency argument [ ${concurrency} ]`);
        }

        this._allocated = new Set();

        this._concurrency = concurrency;

        this._queue = [ ];

        this._threads = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_PATH);

            const thread = new WorkerThread(worker);

            this._threads.push(thread);

            logger.info(`Starting worker [ ${thread.getId()} ]`);
        }
    }

    /**
     * The number of threads managed by this instance.
     *
     * @returns {number}
     */
    get concurrency() {
        return this._concurrency;
    }

    /**
     * Allocates a free worker thread if available, or waits for one to be freed.
     *
     * @public
     * @returns {Promise<WorkerThread>} - A promise that resolves to an available worker thread.
     */
    async allocate() {
        const thread = this._threads.find(t => !this._allocated.has(t)) || null;

        if (thread !== null) {
            this._allocated.add(thread);

            logger.debug(`Allocated a thread [ ${thread.getId()} ]`);

            return thread;
        } else {
            const deferred = new DeferredPromise();

            this._queue.push(deferred);

            return deferred.promise
                .then((thread) => {
                    logger.debug(`Allocated a thread [ ${thread.getId()} ] after waiting`);

                    return thread;
                })
        }
    }

    /**
     * Allocates all available threads.
     *
     * @public
     * @returns {Array<Promise<WorkerThread>>} - An array of promises, each resolving to an allocated WorkerThread.
     */
    allocateAll() {
        const promises = [ ];

        for (let i = 0; i < this._concurrency; i++) {
            const promise = this.allocate();

            promises.push(promise);
        }

        return promises;
    }

    /**
     * Broadcasts a {@link WorkerRequest} to all threads.
     *
     * @param {WorkerRequest} request - The request.
     * @returns {Promise<Array<*>>} - An array of length = concurrency, where each element is a result promise.
     */
    async broadcast(request) {
        const allocations = this.allocateAll();

        const requests = allocations.map((promise) => {
            return promise
                .then(async (thread) => {
                    const response = await thread.send(request);

                    this.free(thread);

                    return response;
                });
        });

        return Promise.all(requests);
    }

    /**
     * Frees a previously allocated thread and resolves the next waiting promise if any.
     *
     * @public
     * @param {WorkerThread} thread - The thread to free.
     */
    free(thread) {
        assert(thread instanceof WorkerThread);

        if (thread.busy) {
            throw new Error(`Unable to free a busy thread [ ${thread.getId()} ]`);
        }

        logger.debug(`Freeing a thread [ ${thread.getId()} ]`);

        this._allocated.delete(thread);

        if (this._queue.length > 0) {
            const promise = this._queue.shift();

            this._allocated.add(thread);

            promise.resolve(thread);
        }
    }

    /**
     * Terminates all threads and clears internal state.
     *
     * @public
     */
    terminate() {
        if (this._allocated.size > 0) {
            throw new Error(`Unable to terminate WorkerManager - there are [ ${this._allocated.size} ] allocated threads`);
        }

        const busy = this._threads.filter(t => t.busy).length;

        if (busy > 0) {
            throw new Error(`Unable to terminate WorkerManager - there are [ ${busy} ] threads`);
        }

        this._threads.forEach((thread) => {
            thread.worker.terminate();

            logger.info(`Terminated Worker [ ${thread.getId()} ]`);
        });

        this._threads = [ ];
    }
}

module.exports = WorkerManager;
