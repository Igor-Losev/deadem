/** @import ParserEngine from '../ParserEngine.js' */

/** @import DemoPacket from '../data/DemoPacket.js' */

import Transform from '#core/stream/Transform.js';

import DemoPacketPrioritizer from '../processing/DemoPacketPrioritizer.js';

/**
 * Handles prioritization of internal messages for
 * packets of the following types:
 *
 * - {@link DemoPacketType.DEM_PACKET}
 * - {@link DemoPacketType.DEM_SIGNON_PACKET}
 * - {@link DemoPacketType.DEM_FULL_PACKET}
 *
 * All other packet types are passed through unchanged.
 *
 * Stream wrapper around {@link DemoPacketPrioritizer}.
 */
class DemoStreamPacketPrioritizer extends Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {number} highWaterMark
     */
    constructor(engine, highWaterMark) {
        super(highWaterMark);

        /** @private */
        this._prioritizer = new DemoPacketPrioritizer(engine.getPerformanceTracker());
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        this._prioritizer.prioritize(demoPacket);

        this._push(demoPacket);
    }
}

export default DemoStreamPacketPrioritizer;
