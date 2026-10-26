/** @import ParserEngine from '../ParserEngine.js' */

/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Transform from '#core/stream/Transform.js';

import DemoPacketParser from '../processing/DemoPacketParser.js';

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload.
 * Tracks unparsed demo and message packets.
 *
 * Stream wrapper around {@link DemoPacketParser}.
 */
class DemoStreamPacketParser extends Transform {
    /**
     * @constructor
     * @public
     * @param {ParserEngine} engine
     * @param {number} highWaterMark
     * @param {((id: number) => boolean)|null} messagePacketFilter
     */
    constructor(engine, highWaterMark, messagePacketFilter) {
        super(highWaterMark);

        /** @private */
        this._parser = new DemoPacketParser(engine.codec, messagePacketFilter, engine.getPacketTracker(), engine.getPerformanceTracker());
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        const demoPacket = this._parser.parse(demoPacketRaw);

        if (demoPacket === null) {
            return;
        }

        this._push(demoPacket);
    }
}

export default DemoStreamPacketParser;
