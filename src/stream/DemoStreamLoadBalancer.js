'use strict';

const Stream = require('stream');

/**
 * Balances stream processing load by periodically yielding control back to
 * the Node.js event loop, preventing long blocking operations and allowing
 * garbage collection to proceed smoothly.
 */
class DemoStreamLoadBalancer extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._counter = 0;
    }

    /**
     * @public
     * @param {demoPacketRaw} demoPacketRaw
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(demoPacketRaw, encoding, callback) {
        this._counter += 1;

        if (this._counter % 1000 === 0) {
            await pauseTimeout(0);
        }

        this.push(demoPacketRaw);

        callback();
    }
}

function pauseImmediate() {
    return new Promise((resolve) => {
        setImmediate(() => {
            resolve();
        });
    });
}

function pauseTimeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

module.exports = DemoStreamLoadBalancer;
