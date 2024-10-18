const path = require('path');

const { Worker } = require('node:worker_threads');

const WORKER_PATH = path.resolve(__dirname, './Worker.js');

class WorkerManager {
    constructor(concurrency) {
        this._concurrency = concurrency;

        this._workers = [ ];

        for (let i = 0; i < concurrency; i++) {
            const worker = new Worker(WORKER_PATH);

            console.log(`Starting worker [ ${worker.threadId} ]`);

            this._workers.push(worker);
        }
    }
}

module.exports = WorkerManager;
