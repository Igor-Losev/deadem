const { Worker } = require('node:worker_threads'),
    path = require('path');

const Logger = require('./../providers/LoggerProvider.instance');

const logger = Logger.getLogger('WorkerManager');

const WORKER_PATH = path.resolve(__dirname, './worker.js');

const BATCH_SIZE = 20;

class WorkerManager {
    constructor(concurrency) {
        this._concurrency = concurrency;

        this._busy = new Set();
        this._deferredPromises = new Map();

        this._pending = [ ];

        this._workers = [ ];

        this._batch = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_PATH);

            worker.on('message', (message) => {
                const { resolve, reject } = this._deferredPromises.get(worker.threadId);

                this._busy.delete(worker.threadId);
                this._deferredPromises.delete(worker.threadId);

                resolve(message);

                if (this._pending.length > 0) {
                    const { resolve } = this._pending.shift();

                    resolve();
                }
            });

            this._workers.push(worker);

            logger.info(`Starting worker [ ${worker.threadId} ]`);
        }
    }

    getIsBusy() {
        return this._busy.size === this._concurrency;
    }

    /**
     * @public
     *
     * @param {Buffer} buffer
     */
    async parse(buffer) {
        this._batch.push(buffer);

        if (this._batch.length < BATCH_SIZE) {
            this._batch.push();
        }

        const isBusy = this.getIsBusy();

        if (isBusy) {
            throw new Error(`Unable to start parsing buffer. All threads are busy`);
        }

        const worker = this._workers.find(worker => !this._busy.has(worker.threadId)) || null;

        if (worker === null) {
            throw new Error('Unable to find available worker');
        }

        this._busy.add(worker.threadId);

        const promise = new Promise((resolve, reject) => {
            this._deferredPromises.set(worker.threadId, {resolve, reject});
        });

        worker.postMessage(buffer);

        return promise;
    }

    /**
     * @public
     *
     * @returns {Promise<void>}
     */
    async ready() {
        if (!this.getIsBusy()) {
            return;
        }

        const promise = new Promise((resolve) => {
            this._pending.push({ resolve });
        });

        return promise;
    }

    terminate() {
        this._workers.forEach((worker) => {
            worker.terminate();
        });
    }
}

module.exports = WorkerManager;
