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
class WorkerManagerNode {
    /**
     * @constructor
     * @param {number} concurrency - Number of worker threads to manage.
     * @param {Logger} logger - Logger.
     */
    constructor(concurrency, logger) {
        Assert.isTrue(concurrency > 0 && Number.isInteger(concurrency), `Invalid concurrency argument [ ${concurrency} ]`);
        Assert.isTrue(logger instanceof Logger);

        this._concurrency = concurrency;
        this._logger = logger;

        this._allocations = new Set();

        this._queue = [ ];
        this._threads = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_SCRIPT_PATH);

            const thread = new WorkerThread(worker, i, logger);

            this._threads.push(thread);

            this._logger.info(`Starting worker [ ${thread.localId} ]`);
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
     * @param {number=} id - A thread id.
     * @returns {Promise<WorkerThread>} - A promise that resolves to an available worker thread.
     */
    async allocate(id) {
        Assert.isTrue(id === undefined || id < this._concurrency);

        let thread;

        if (Number.isInteger(id)) {
            thread = !this._allocations.has(id)
                ? this._threads[id]
                : null;
        } else {
            thread = this._threads.find(t => !this._allocations.has(t.localId)) || null;
        }

        if (thread !== null) {
            this._allocations.add(thread.localId);

            return thread;
        } else {
            const item = createQueueItem(id);

            this._queue.push(item);

            return item.deferred.promise;
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
            const promise = this.allocate(i);

            promises.push(promise);
        }

        return promises;
    }

    /**
     * Broadcasts a {@link WorkerRequest} to all threads.
     *
     * @param {WorkerRequest} request - The request.
     * @returns {Promise<Array<*>>} - An array of length === concurrency, where each element is a result promise.
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
     * @public
     * @returns {boolean}
     */
    getIsAllBusy() {
        return this._threads.every(t => t.busy);
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
            throw new Error(`Unable to free a busy thread [ ${thread.localId} ]`);
        }

        if (this._queue.length === 0) {
            this._allocations.delete(thread.localId);
        }

        const targetIndex = this._queue.findIndex(item => item.id === thread.localId);

        if (targetIndex >= 0) {
            const [ target ] = this._queue.splice(targetIndex, 1);

            target.deferred.resolve(thread);

            return;
        }

        const availableIndex = this._queue.findIndex(item => item.id === null);

        if (availableIndex >= 0) {
            const [ target ] = this._queue.splice(availableIndex, 1);

            target.deferred.resolve(thread);
        } else {
            this._allocations.delete(thread.localId);
        }
    }

    /**
     * Terminates all threads and clears internal state.
     *
     * @public
     */
    terminate() {
        if (this._allocations.size > 0) {
            throw new Error(`Unable to terminate WorkerManager - there are [ ${this._allocations.size} ] allocated threads`);
        }

        const busy = this._threads.filter(t => t.busy).length;

        if (busy > 0) {
            throw new Error(`Unable to terminate WorkerManager - there are [ ${busy} ] threads`);
        }

        this._threads.forEach((thread) => {
            thread.worker.terminate();

            this._logger.info(`Terminated Worker [ ${thread.localId} ]`);
        });

        this._threads = [ ];
    }
}

function createQueueItem(id) {
    return {
        deferred: new DeferredPromise(),
        id: Number.isInteger(id)
            ? id
            : null
    };
}

export default WorkerManagerNode;
