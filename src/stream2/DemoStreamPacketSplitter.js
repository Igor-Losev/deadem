import TransformStream from '#core/stream/TransformStream.js';

import DemoPacket from '#data/DemoPacket.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

class DemoStreamPacketSplitter extends TransformStream {
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
     * @param {Array<DemoPacketRawBatch, Array<EntityMutationEventPacked>>} data
     */
    _handle(data) {
        const [ batch, events ] = data;

        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        batch.packets.forEach((demoPacketRaw) => {
            const demoPacket = DemoPacket.parse(demoPacketRaw);

            // console.log(demoPacket);
        });

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);
    }
}

export default DemoStreamPacketSplitter;
