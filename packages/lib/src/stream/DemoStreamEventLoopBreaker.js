import Assert from '#core/Assert.js';

import TransformStream from '#core/stream/TransformStream.js';

/**
 * Balances stream processing load by periodically yielding control back to
 * the event loop, preventing long blocking operations and allowing
 * garbage collection to proceed smoothly.
 */
class DemoStreamEventLoopBreaker extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {number} breakInterval
     */
    constructor(engine, breakInterval) {
        super();

        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0);

        this._engine = engine;
        this._breakInterval = breakInterval;

        this._counter = 0;
    }

    /**
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        this._counter += 1;

        if (this._counter % this._breakInterval === 0) {
            await pauseTimeout(0);
        }

        this._push(demoPacketRaw);
    }
}

function pauseTimeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export default DemoStreamEventLoopBreaker;
