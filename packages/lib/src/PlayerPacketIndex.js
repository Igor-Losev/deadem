import Assert from '#core/Assert.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';
import DemoPacketType from '#data/enums/DemoPacketType.js';

const BOOTSTRAP_PACKET_TYPES = [
    DemoPacketType.DEM_SEND_TABLES,
    DemoPacketType.DEM_CLASS_INFO,
    DemoPacketType.DEM_STRING_TABLES,
    DemoPacketType.DEM_SIGNON_PACKET
];

class PlayerPacketIndex {
    /**
     * @public
     * @constructor
     * @param {Array<DemoPacketRaw>} packets
     */
    constructor(packets) {
        Assert.isTrue(Array.isArray(packets), 'packets must be an array');

        this._packets = packets;

        this._bootstrap = [];
        this._keyframes = [];
        this._stringTableSnapshots = new Map();

        this._build();
    }

    /**
     * Returns all keyframe indices.
     *
     * @public
     * @returns {Array<number>}
     */
    get keyframes() {
        return this._keyframes;
    }

    /**
     * Returns the total number of packets.
     *
     * @public
     * @returns {number}
     */
    get length() {
        return this._packets.length;
    }

    /**
     * Returns a packet by index.
     *
     * @public
     * @param {number} index
     * @returns {DemoPacketRaw|null}
     */
    get(index) {
        Assert.isTrue(Number.isInteger(index), 'index must be an integer');

        return this._packets[index] || null;
    }

    /**
     * Returns a packet by index or throws if not found.
     *
     * @public
     * @param {number} index
     * @returns {DemoPacketRaw}
     */
    getOrFail(index) {
        const packet = this.get(index);

        if (packet === null) {
            throw new Error(`Packet not found at index [ ${index} ]`);
        }

        return packet;
    }

    /**
     * Returns all data required to reconstruct the game state at the specified tick.
     *
     * @public
     * @param {number} tick
     * @returns {{bootstrap: Array<DemoPacketRaw>, stringTableSnapshots: Array<*>, packets: Array<DemoPacketRaw>}}
     */
    getPacketsForTick(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        const keyframeIndex = this._findKeyframeBefore(tick);
        const packetIndex = this._findAfterTick(tick) ?? this._packets.length - 1;

        const keyframePosition = this._keyframes.findIndex(ki => ki === keyframeIndex);

        const stringTableSnapshots = this._keyframes
            .slice(0, keyframePosition)
            .map(ki => this._stringTableSnapshots.get(ki));

        return {
            bootstrap: this._bootstrap.map(i => this._packets[i]),
            stringTableSnapshots,
            packets: this._getRange(keyframeIndex, packetIndex)
        };
    }

    /**
     * Returns the tick value of the next distinct tick after the specified tick.
     *
     * @public
     * @param {number} tick
     * @returns {number|null} Next tick value or null if at the end.
     */
    nextTick(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        const index = this._findAfterTick(tick);

        if (index === null) {
            return null;
        }

        return this._packets[index].tick.value;
    }

    /**
     * Returns the tick value of the previous distinct tick before the specified tick.
     *
     * @public
     * @param {number} tick
     * @returns {number|null} Previous tick value or null if at the beginning.
     */
    prevTick(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        for (let i = this._packets.length - 1; i >= 0; i--) {
            if (this._packets[i].tick.value < tick) {
                return this._packets[i].tick.value;
            }
        }

        return null;
    }

    /**
     * Builds the keyframe index.
     *
     * @protected
     */
    _build() {
        for (let i = 0; i < this._packets.length; i++) {
            const packet = this._packets[i];
            const typeId = packet.getTypeId();

            if (packet.getIsInitial() && BOOTSTRAP_PACKET_TYPES.some(packetType => packetType.id === typeId)) {
                this._bootstrap.push(i);
            }

            if (typeId === DemoPacketType.DEM_FULL_PACKET.id) {
                this._keyframes.push(i);

                const decoded = packet.decode();

                if (decoded === null) {
                    continue;
                }

                this._stringTableSnapshots.set(i, decoded.stringTable);
            }
        }
    }

    /**
     * Finds the first packet index with a tick strictly greater than the specified tick.
     *
     * @protected
     * @param {number} tick
     * @returns {number|null} Packet index or null if not found.
     */
    _findAfterTick(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        for (let i = 0; i < this._packets.length; i++) {
            if (this._packets[i].tick.value > tick) {
                return i;
            }
        }

        return null;
    }

    /**
     * Finds the packet index for the specified tick.
     * Returns the first packet with a tick >= the specified tick.
     *
     * @protected
     * @param {number} tick
     * @returns {number|null} Packet index or null if not found.
     */
    _findByTick(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        for (let i = 0; i < this._packets.length; i++) {
            if (this._packets[i].tick.value >= tick) {
                return i;
            }
        }

        return null;
    }

    /**
     * Finds the nearest keyframe index at or before the specified tick.
     *
     * @protected
     * @param {number} tick
     * @returns {number} Packet index of the keyframe.
     */
    _findKeyframeBefore(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        let left = 0;
        let right = this._keyframes.length - 1;
        let result = 0;

        while (left <= right) {
            const mid = (left + right) >>> 1;
            const keyframeIndex = this._keyframes[mid];
            const keyframeTick = this._packets[keyframeIndex].tick.value;

            if (keyframeTick <= tick) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return this._keyframes[result];
    }

    /**
     * Returns packets in the specified range.
     *
     * @protected
     * @param {number} from - Start index (inclusive).
     * @param {number} to - End index (exclusive).
     * @returns {Array<DemoPacketRaw>}
     */
    _getRange(from, to) {
        Assert.isTrue(Number.isInteger(from), 'from must be an integer');
        Assert.isTrue(Number.isInteger(to), 'to must be an integer');

        return this._packets.slice(from, to);
    }
}

export default PlayerPacketIndex;
