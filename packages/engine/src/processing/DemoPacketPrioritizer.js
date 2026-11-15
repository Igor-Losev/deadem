/** @import DemoPacket from '../data/DemoPacket.js' */

/** @import PerformanceTracker from '../trackers/PerformanceTracker.js' */

/** @import { DemoPacketHeavyData } from '../PacketCodec.js' */

import Assert from '../core/Assert.js';

import MessagePacketType from '../data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import ParserDiagnostics from '../ParserDiagnostics.js';

/**
 * Handles prioritization of internal messages for
 * packets of the following types:
 *
 * - {@link DemoPacketType.DEM_PACKET}
 * - {@link DemoPacketType.DEM_SIGNON_PACKET}
 * - {@link DemoPacketType.DEM_FULL_PACKET}
 *
 * All other packet types are left unchanged.
 */
class DemoPacketPrioritizer {
    /** @private @type {PerformanceTracker} */
    _performanceTracker;

    /**
     * @public
     * @constructor
     * @param {ParserDiagnostics} diagnostics
     */
    constructor(diagnostics) {
        Assert.isTrue(diagnostics instanceof ParserDiagnostics, 'Invalid diagnostics: expected an instance of ParserDiagnostics');

        this._performanceTracker = diagnostics.performance;
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     */
    prioritize(demoPacket) {
        if (!demoPacket.type.heavy) {
            return;
        }

        this._performanceTracker.start(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);

        /** @type {DemoPacketHeavyData} */ (demoPacket.data).messagePackets.sort((/** @type {*} */ a, /** @type {*} */ b) => {
            const priorityA = getPacketPriority(a.type);
            const priorityB = getPacketPriority(b.type);

            return priorityB - priorityA;
        });

        this._performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);
    }
}

/**
 * @param {MessagePacketType} type
 * @returns {number}
 */
function getPacketPriority(type) {
    switch (type) {
        case MessagePacketType.NET_TICK:
            return 100;
        case MessagePacketType.SVC_CREATE_STRING_TABLE:
        case MessagePacketType.SVC_UPDATE_STRING_TABLE:
        case MessagePacketType.NET_SPAWN_GROUP_LOAD:
            return 10;
        case MessagePacketType.SVC_PACKET_ENTITIES:
            return -10;
        case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT:
            return -100;
        default:
            return 0;
    }
}

export default DemoPacketPrioritizer;
