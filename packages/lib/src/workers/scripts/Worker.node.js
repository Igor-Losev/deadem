import { parentPort } from 'node:worker_threads';

import Worker from './Worker.js';

new class extends Worker {
    constructor() {
        super();

        parentPort.on('message', (requestRaw) => {
            this._route(requestRaw);
        });
    }

    /**
     * @protected
     * @param {WorkerResponse} response
     */
    _respond(response) {
        parentPort.postMessage(response.serialize(), response.transfers);
    }
};
