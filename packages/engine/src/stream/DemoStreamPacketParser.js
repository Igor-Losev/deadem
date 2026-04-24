import Transform from '#core/stream/Transform.js';

import MessagePacket from '#data/MessagePacket.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload.
 * Tracks unparsed demo and message packets.
 */
class DemoStreamPacketParser extends Transform {
    /**
     * @constructor
     * @public
     * @param {ParserEngine} engine
     * @param {function(number): boolean} messagePacketFilter
     */
    constructor(engine, messagePacketFilter) {
        super();

        this._engine = engine;
        this._messagePacketFilter = messagePacketFilter;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        const demoPacket = this._engine.codec.parseDemoPacket(demoPacketRaw, this._messagePacketFilter);

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
