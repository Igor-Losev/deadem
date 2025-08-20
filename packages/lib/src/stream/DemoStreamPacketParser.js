import TransformStream from '#core/stream/TransformStream.js';

import DemoPacket from '#data/DemoPacket.js';
import MessagePacket from '#data/MessagePacket.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload.
 * Tracks unparsed demo and message packets.
 */
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

        if (demoPacket === null) {
            this._engine.getPacketTracker().handleDemoPacketRaw(demoPacketRaw);

            this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            return;
        }

        if (demoPacket.type.heavy) {
            const parsed = [ ];
            const unparsed = [ ];

            demoPacket.data.messagePackets.forEach((messagePacketOrRaw) => {
                if (messagePacketOrRaw instanceof MessagePacket) {
                    parsed.push(messagePacketOrRaw);
                } else {
                    unparsed.push(messagePacketOrRaw);
                }
            });

            if (unparsed.length > 0) {
                unparsed.forEach((messagePacketRaw) => {
                    this._engine.getPacketTracker().handleMessagePacketRaw(demoPacketRaw, messagePacketRaw);
                });

                demoPacket.data.messagePackets = parsed;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        this._push(demoPacket);
    }
}

export default DemoStreamPacketParser;
