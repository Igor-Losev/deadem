import WorkerManager from './WorkerManager.js';
import WorkerThread from './WorkerThread.browser.js';

import Worker from './scripts/Worker.browser.js?worker&inline';

class WorkerManagerBrowser extends WorkerManager {
    /**
     * @constructor
     * @param {number} concurrency - Number of worker threads to manage.
     * @param {Logger} logger - Logger.
     */
    constructor(concurrency, logger) {
        super(concurrency, logger);

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker();

            const thread = new WorkerThread(worker, i, logger);

            this._threads.push(thread);

            this._logger.info(`Starting worker [ ${thread.localId} ]`);
        }
    }
}

export default WorkerManagerBrowser;
