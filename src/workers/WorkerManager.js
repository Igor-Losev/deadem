import { Worker } from 'node:worker_threads';

import Assert from '#core/Assert.js';
import FileSystem from '#core/FileSystem.js';
import Logger from '#core/Logger.js';

import DeferredPromise from '#data/DeferredPromise.js';

import WorkerThread from './WorkerThread.js';

const WORKER_SCRIPT_PATH = FileSystem.getAbsolutePath(import.meta.url, './scripts/worker.js');

/**
 * Manages a pool of {@link WorkerThread} instances with fixed concurrency.
 */
class WorkerManager {
    /**
     * @constructor
     * @param {number} concurrency - Number of worker threads to manage.
     * @param {Logger} logger - Logger.
     */
    constructor(concurrency, logger) {
        if (concurrency <= 0 || !Number.isInteger(concurrency)) {
            throw new Error(`Invalid concurrency argument [ ${concurrency} ]`);
        }

        Assert.isTrue(logger instanceof Logger);

        this._concurrency = concurrency;
        this._logger = logger;

        this._allocated = new Set();
        this._queue = [ ];
        this._threads = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_SCRIPT_PATH);

            const thread = new WorkerThread(worker, logger);

            this._threads.push(thread);

            this._logger.info(`Starting worker [ ${thread.getId()} ]`);
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

            this._logger.trace(`Allocated a thread [ ${thread.getId()} ]`);

            return thread;
        } else {
            const deferred = new DeferredPromise();

            this._queue.push(deferred);

            return deferred.promise
                .then((thread) => {
                    this._logger.trace(`Allocated a thread [ ${thread.getId()} ] after waiting`);

                    return thread;
                });
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
        Assert.isTrue(thread instanceof WorkerThread);

        if (thread.busy) {
            throw new Error(`Unable to free a busy thread [ ${thread.getId()} ]`);
        }

        this._logger.trace(`Freeing a thread [ ${thread.getId()} ]`);

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

            this._logger.info(`Terminated Worker [ ${thread.getId()} ]`);
        });

        this._threads = [ ];
    }
}

export default WorkerManager;
