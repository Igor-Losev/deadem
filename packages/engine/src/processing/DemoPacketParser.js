/** @import DemoPacket from '../data/DemoPacket.js' */
/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

/** @import PacketTracker from '../trackers/PacketTracker.js' */
/** @import PerformanceTracker from '../trackers/PerformanceTracker.js' */

/** @import { DemoPacketHeavyData } from '../PacketCodec.js' */

import Assert from '../core/Assert.js';

import MessagePacket from '../data/MessagePacket.js';

import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import PacketCodec from '../PacketCodec.js';
import ParserConfiguration from '../ParserConfiguration.js';
import ParserDiagnostics from '../ParserDiagnostics.js';

/**
 * Parses a {@link DemoPacketRaw} payload into a {@link DemoPacket}.
 * Tracks unparsed demo and message packets.
 */
class DemoPacketParser {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {((messagePacketTypeId: number) => boolean)|null} */
    _messagePacketFilter;

    /** @private @type {PacketTracker} */
    _packetTracker;

    /** @private @type {PerformanceTracker} */
    _performanceTracker;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     * @param {ParserDiagnostics} diagnostics
     * @param {PacketCodec} codec
     */
    constructor(configuration, diagnostics, codec) {
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(diagnostics instanceof ParserDiagnostics, 'Invalid diagnostics: expected an instance of ParserDiagnostics');
        Assert.isTrue(codec instanceof PacketCodec, 'Invalid codec: expected an instance of PacketCodec');

        this._codec = codec;
        this._messagePacketFilter = configuration.messagePacketFilter;
        this._packetTracker = diagnostics.packet;
        this._performanceTracker = diagnostics.performance;
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
