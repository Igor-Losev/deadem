import Assert from '#core/Assert.js';

import BroadcastAgent from './BroadcastAgent.js';

class BroadcastReadStreamBrowser extends ReadableStream {
    /**
    * @constructor
    * @param {BroadcastAgent} agent
    * @param {*} [options={ }]
    */
    constructor(agent, options = { }) {
        Assert.isTrue(agent instanceof BroadcastAgent);

        super({
            start(controller) {
                agent.subscribe((chunk) => {
                    if (chunk === null) {
                        controller.close();
                    } else {
                        controller.enqueue(chunk);
                    }
                });
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

