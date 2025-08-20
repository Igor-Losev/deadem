import TransformStream from '#core/stream/TransformStream.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

/**
 * Handles prioritization of internal messages for
 * packets of the following types:
 *
 * - {@link DemoPacketType.DEM_PACKET}
 * - {@link DemoPacketType.DEM_SIGNON_PACKET}
 * - {@link DemoPacketType.DEM_FULL_PACKET}
 *
 * All other packet types are passed through unchanged.
 */
class DemoStreamPacketPrioritizer extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        if (!demoPacket.type.heavy) {
            this._push(demoPacket);

            return;
        }

        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);

        demoPacket.data.messagePackets.sort((a, b) => {
            const priorityA = getPacketPriority(a.type);
            const priorityB = getPacketPriority(b.type);

            return priorityB - priorityA;
        });

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);

        this._push(demoPacket);
    }
}

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

export default DemoStreamPacketPrioritizer;
