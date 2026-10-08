/** @import DemoPacket from '../data/DemoPacket.js' */
/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

/** @import { DemoPacketHeavyData } from '../PacketCodec.js' */

import Assert from '../core/Assert.js';

import MessagePacket from '../data/MessagePacket.js';

import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import PacketTracker from '../trackers/PacketTracker.js';
import PerformanceTracker from '../trackers/PerformanceTracker.js';

import PacketCodec from '../PacketCodec.js';

/**
 * Parses a {@link DemoPacketRaw} payload into a {@link DemoPacket}.
 * Tracks unparsed demo and message packets.
 */
class DemoPacketParser {
    /**
     * @public
     * @constructor
     * @param {PacketCodec} codec
     * @param {((id: number) => boolean)|null} messagePacketFilter
     * @param {PacketTracker} packetTracker
     * @param {PerformanceTracker} performanceTracker
     */
    constructor(codec, messagePacketFilter, packetTracker, performanceTracker) {
        Assert.isTrue(codec instanceof PacketCodec, 'Invalid codec: expected an instance of PacketCodec');
        Assert.isTrue(messagePacketFilter === null || typeof messagePacketFilter === 'function', 'Invalid messagePacketFilter: expected a function or null');
        Assert.isTrue(packetTracker instanceof PacketTracker, 'Invalid packetTracker: expected an instance of PacketTracker');
        Assert.isTrue(performanceTracker instanceof PerformanceTracker, 'Invalid performanceTracker: expected an instance of PerformanceTracker');

        /** @private */
        this._codec = codec;
        /** @private */
        this._messagePacketFilter = messagePacketFilter;
        /** @private */
        this._packetTracker = packetTracker;
        /** @private */
        this._performanceTracker = performanceTracker;
    }

    /**
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {DemoPacket|null} The parsed packet, or null if it cannot be parsed.
     */
    parse(demoPacketRaw) {
        this._performanceTracker.start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        const demoPacket = this._codec.parseDemoPacket(demoPacketRaw, this._messagePacketFilter);

        if (demoPacket === null) {
            this._packetTracker.handleDemoPacketRaw(demoPacketRaw);

            this._performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            return null;
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
                    this._packetTracker.handleMessagePacketRaw(demoPacketRaw, messagePacketRaw);
                });

                data.messagePackets = parsed;
            }
        }

        this._performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

        return demoPacket;
    }
}

export default DemoPacketParser;
