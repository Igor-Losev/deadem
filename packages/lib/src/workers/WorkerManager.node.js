import { Worker } from 'node:worker_threads';

import FileSystem from '#core/FileSystem.js';

import WorkerThread from '#workers/WorkerThread.node.js';

import WorkerManager from './WorkerManager.js';

const WORKER_SCRIPT_PATH = FileSystem.getAbsolutePath(import.meta.url, './scripts/Worker.node.js');

/**
 * Manages a pool of {@link WorkerThread} instances with fixed concurrency.
 */
class WorkerManagerNode extends WorkerManager {
    /**
     * @constructor
     * @param {number} concurrency - Number of worker threads to manage.
     * @param {Logger} logger - Logger.
     */
    constructor(concurrency, logger) {
        super(concurrency, logger);

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_SCRIPT_PATH);

            const thread = new WorkerThread(worker, i, logger);

            this._threads.push(thread);

            this._logger.info(`Starting worker [ ${thread.localId} ]`);
        }
    }
}

export default WorkerManagerNode;
