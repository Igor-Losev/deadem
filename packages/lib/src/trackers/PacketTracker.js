import PacketTrackerRegistry from '#data/trackers/PacketTrackerRegistry.js';

import Tracker from './Tracker.js';

class PacketTracker extends Tracker {
    constructor() {
        super();

        this._parsed = new PacketTrackerRegistry();
        this._unparsed = new PacketTrackerRegistry();
    }

    /**
     * @public
     * @returns {PacketTrackerStats}
     */
    getStats() {
        return {
            parsed: this._parsed.unpack(),
            unparsed: this._unparsed.unpack()
        };
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemoPacket(demoPacket) {
        this._parsed.register(demoPacket.type.id);
    }

    /**
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     */
    handleDemoPacketRaw(demoPacketRaw) {
        this._unparsed.register(demoPacketRaw.getTypeId());
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     * @param {MessagePacket} messagePacket
     */
    handleMessagePacket(demoPacket, messagePacket) {
        this._parsed.register(demoPacket.type.id, messagePacket.type.id);
    }

    /**
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {MessagePacketRaw} messagePacketRaw
     */
    handleMessagePacketRaw(demoPacketRaw, messagePacketRaw) {
        this._unparsed.register(demoPacketRaw.getTypeId(), messagePacketRaw.type);
    }
}

/**
 * @typedef {{unparsed: Array<PacketTrackerUnpackedItem>, parsed: Array<PacketTrackerUnpackedItem>}} PacketTrackerStats
 */

export default PacketTracker;
