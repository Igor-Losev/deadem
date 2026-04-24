import Assert from '#core/Assert.js';

import PacketTrackerRegistry from '#data/trackers/PacketTrackerRegistry.js';
import SchemaRegistry from '#src/SchemaRegistry.js';

import Tracker from './Tracker.js';

class PacketTracker extends Tracker {
    /**
     * @constructor
     * @param {SchemaRegistry} registry
     */
    constructor(registry) {
        super();
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');

        this._registry = registry;
        this._parsed = new PacketTrackerRegistry();
        this._unparsed = new PacketTrackerRegistry();
    }

    /**
     * @public
     * @returns {PacketTrackerStats}
     */
    getStats() {
        return {
            parsed: this._enrich(this._parsed.unpack()),
            unparsed: this._enrich(this._unparsed.unpack())
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

    /**
     * @protected
     * @param {Array<PacketTrackerUnpackedItem>} items
     * @returns {Array<PacketTrackerPrintableItem>}
     */
    _enrich(items) {
        return items.map((item) => {
            const demoPacketType = this._registry.resolveDemoType(item.type);

            return {
                type: item.type,
                code: demoPacketType === null ? 'Unknown' : demoPacketType.code,
                count: item.count,
                children: item.children.map((child) => {
                    const messagePacketType = this._registry.resolveMessageType(child.type);

                    return {
                        type: child.type,
                        code: messagePacketType === null ? 'Unknown' : messagePacketType.code,
                        count: child.count,
                        children: [ ]
                    };
                })
            };
        });
    }
}

/**
 * @typedef {{unparsed: Array<PacketTrackerPrintableItem>, parsed: Array<PacketTrackerPrintableItem>}} PacketTrackerStats
 * @typedef {{children: Array<PacketTrackerPrintableItem>, code: string, count: number, type: number}} PacketTrackerPrintableItem
 */

export default PacketTracker;
