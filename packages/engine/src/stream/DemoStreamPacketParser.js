/** @import ParserEngine from '#root/src/ParserEngine.js' */

/** @import DemoPacketRaw from '#data/DemoPacketRaw.js' */

/** @import { DemoPacketHeavyData } from '#root/src/PacketCodec.js' */

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
     * @param {number} highWaterMark
     * @param {(id: number) => boolean} messagePacketFilter
     */
    constructor(engine, highWaterMark, messagePacketFilter) {
        super(highWaterMark);

        /** @private */
        this._engine = engine;
        /** @private */
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
            const data = /** @type {DemoPacketHeavyData} */ (demoPacket.data);

            /** @type {Array<*>} */
            const parsed = [ ];
            /** @type {Array<*>} */
            const unparsed = [ ];

            data.messagePackets.forEach((/** @type {*} */ messagePacketOrRaw) => {
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

                data.messagePackets = parsed;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        this._push(demoPacket);
    }
}

export default DemoStreamPacketParser;
