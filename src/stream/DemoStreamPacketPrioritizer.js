'use strict';

const Stream = require('stream');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

/**
 * Handles prioritization of internal messages within demo packets.
 *
 * For packets of the following types:
 * - {@link DemoCommandType.DEM_PACKET}
 * - {@link DemoCommandType.DEM_FULL_PACKET}
 * - {@link DemoCommandType.DEM_SIGNON_PACKET}
 *
 * This class prioritizes internal messages and forwards them in the desired order.
 * All other packet types are passed through unchanged.
 */
class DemoStreamPacketPrioritizer extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._packets = [ DemoCommandType.DEM_PACKET, DemoCommandType.DEM_FULL_PACKET, DemoCommandType.DEM_SIGNON_PACKET ];
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        if (!this._packets.includes(demoPacket.command)) {
            this.push(demoPacket);

            callback();

            return;
        }

        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);

        demoPacket.data.sort((a, b) => {
            const priorityA = getPacketPriority(a.type);
            const priorityB = getPacketPriority(b.type);

            return priorityB - priorityA;
        });

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PRIORITIZER);

        this.push(demoPacket);

        callback();
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

module.exports = DemoStreamPacketPrioritizer;
