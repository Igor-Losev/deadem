import Worker from './Worker.js';

new class extends Worker {
    constructor() {
        super();

        self.onmessage = (message) => {
            this._route(message.data);
        };
    }

    /**
     * @protected
     * @param {WorkerResponse} response
     */
    _respond(response) {
        self.postMessage(response.serialize());
    }
};
