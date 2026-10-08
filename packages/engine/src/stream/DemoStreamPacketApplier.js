/** @import ParserEngine from '../ParserEngine.js' */

/** @import DemoPacket from '../data/DemoPacket.js' */

import Transform from '#core/stream/Transform.js';

import DemoPacketApplier from '../processing/DemoPacketApplier.js';

/**
 * Given a stream of {@link DemoPacket}, applies them sequentially
 * to the {@link Demo} state. Parks between packets while paused.
 *
 * Stream wrapper around {@link DemoPacketApplier}.
 */
class DemoStreamPacketApplier extends Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {number} highWaterMark
     */
    constructor(engine, highWaterMark) {
        super(highWaterMark);

        /** @private */
        this._engine = engine;

        /** @private */
        this._applier = new DemoPacketApplier(
            engine.getDemoPacketHandler(),
            engine.getDemoMessageHandler(),
            engine.getDemoEntityHandler(),
            engine.interceptors,
            engine.getPacketTracker(),
            engine.getPerformanceTracker()
        );
    }

    /**
     * @async
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        const pausePromise = this._engine.pausePromise;

        if (pausePromise !== null) {
            await pausePromise.promise;
        }

        this._applier.apply(demoPacket);
    }
}

export default DemoStreamPacketApplier;
