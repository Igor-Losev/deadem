import Stream from 'node:stream';

import Assert from '#core/Assert.js';

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

        this._agent = agent;

        this._agent.subscribe((chunk) => {
            this.push(chunk);
        });

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
}

export default BroadcastReadStreamNode;

