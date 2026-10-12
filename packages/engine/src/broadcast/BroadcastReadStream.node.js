import Stream from 'node:stream';

import Assert from '../core/Assert.js';

import BroadcastAgent from './BroadcastAgent.js';

class BroadcastReadStreamNode extends Stream.Readable {
    /**
     * @constructor
     * @param {BroadcastAgent} agent
     * @param {*} [options={}]
     */
    constructor(agent, options = { }) {
        super(options);

        Assert.isTrue(agent instanceof BroadcastAgent);

        /** @private */
        this._agent = agent;
        /** @private */
        this._listener = (/** @type {Uint8Array|null} */ chunk) => {
            this.push(chunk);
        };

        this._agent.subscribe(this._listener);

        this.on('pause', () => {
            if (!this._agent.finished) {
                this._agent.pause();
            }
        });

        this.on('resume', () => {
            if (!this._agent.finished) {
                this._agent.resume();
            }
        });
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

    _read() {

    }

    /**
     * @param {Error|null} error
     * @param {(error?: Error|null) => void} callback
     */
    _destroy(error, callback) {
        this._agent.unsubscribe(this._listener);

        if (this._agent.started && !this._agent.finished) {
            this._agent.stop();
        }

        callback(error);
    }
}

export default BroadcastReadStreamNode;

