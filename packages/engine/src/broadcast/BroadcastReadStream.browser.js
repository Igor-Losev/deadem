import Assert from '../core/Assert.js';

import BroadcastAgent from './BroadcastAgent.js';

/** @extends {ReadableStream<Uint8Array>} */
class BroadcastReadStreamBrowser extends ReadableStream {
    /**
    * @constructor
    * @param {BroadcastAgent} agent
    * @param {*} [options={ }]
    */
    constructor(agent, options = { }) {
        Assert.isTrue(agent instanceof BroadcastAgent);

        /** @type {ReadableStreamDefaultController<Uint8Array>} */
        let controller;

        const listener = (/** @type {Uint8Array|null} */ chunk) => {
            if (chunk === null) {
                controller.close();
            } else {
                controller.enqueue(chunk);
            }
        };

        super({
            start(streamController) {
                controller = streamController;

                agent.subscribe(listener);
            },
            cancel() {
                agent.unsubscribe(listener);

                if (agent.started && !agent.finished) {
                    agent.stop();
                }
            }
        }, options);

        this._agent = agent;
    }

    /**
    * @public
    */
    start() {
        this._agent.start();
    }

    /**
    * @public
    */
    stop() {
        this._agent.stop();
    }
}

export default BroadcastReadStreamBrowser;

