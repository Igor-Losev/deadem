import TransformStream from '#core/stream/TransformStream.js';

import DemoPacket from '#data/DemoPacket.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

class DemoStreamPacketParser extends TransformStream {
    /**
     * @constructor
     * @public
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        const demoPacket = DemoPacket.parse(demoPacketRaw);

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        if (demoPacket !== null) {
            this._push(demoPacket);
        }
    }
}

export default DemoStreamPacketParser;
