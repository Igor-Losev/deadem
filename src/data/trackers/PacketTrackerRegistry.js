import Assert from '#core/Assert.js';

const MAX_SAFE_ID = 100000;

class PacketTrackerRegistry {
    constructor() {
        this._registry = new Map();
    }

    /**
     * @public
     * @param {number} demoPacketId
     * @param {number=} messagePacketId
     */
    register(demoPacketId, messagePacketId) {
        Assert.isTrue(demoPacketId <= MAX_SAFE_ID || messagePacketId <= MAX_SAFE_ID || messagePacketId === 0);

        const key = this._encode(demoPacketId, messagePacketId);

        const counter = this._registry.get(key) || 0;

        this._registry.set(key, counter + 1);
    }

    /**
     * @public
     * @returns {Array<PacketTrackerUnpackedItem>}
     */
    unpack() {
        const unpacked = [ ];

        const keys = Array.from(this._registry.keys());

        keys.sort((a, b) => a - b);

        keys.forEach((encoded) => {
            const [ demoPacketId, messagePacketId ] = this._decode(encoded);

            let target = unpacked.find(i => i.type === demoPacketId);

            if (!target) {
                let count;

                if (messagePacketId === null) {
                    count = this._registry.get(encoded);
                } else {
                    count = 0;
                }

                target = createUnpackedItem(demoPacketId, count);

                unpacked.push(target);
            }

            if (messagePacketId !== null) {
                const count = this._registry.get(encoded);

                const child = createUnpackedItem(messagePacketId, count);

                target.children.push(child);
            }
        });

        return unpacked;
    }

    /**
     * @protected
     * @param {number} encoded
     * @returns [number, number|null]
     */
    _decode(encoded) {
        const demoPacketId = Math.trunc(encoded / MAX_SAFE_ID);
        const messagePacketId = encoded % MAX_SAFE_ID;

        return [ demoPacketId, messagePacketId || null ];
    }

    /**
     * @param {number} demoPacketId
     * @param {number=} messagePacketId
     * @returns {number}
     */
    _encode(demoPacketId, messagePacketId = 0) {
        return demoPacketId * MAX_SAFE_ID + messagePacketId;
    }
}

/**
 * @param {number} type
 * @param {number} count
 * @returns {PacketTrackerUnpackedItem}
 */
function createUnpackedItem(type, count) {
    return {
        type,
        count,
        children: [ ]
    };
}

/**
 * @typedef {{children: Array<PacketTrackerUnpackedItem>, count: number, type: number}} PacketTrackerUnpackedItem
 */

export default PacketTrackerRegistry;
