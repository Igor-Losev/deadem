/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import EventLoop from '#core/EventLoop.js';
import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

/**
 * Balances stream processing load by periodically yielding control back to
 * the event loop, preventing long blocking operations and allowing
 * garbage collection to proceed smoothly.
 */
class DemoStreamEventLoopBreaker extends Transform {
    /** @private @type {number} */
    _breakInterval;

    /** @private */
    _counter = 0;

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     */
    constructor(configuration) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');

        this._breakInterval = configuration.breakInterval;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        this._counter += 1;

        if (this._counter % this._breakInterval === 0) {
            await EventLoop.yield();
        }

        this._push(demoPacketRaw);
    }
}

export default DemoStreamEventLoopBreaker;
