/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';

import PacketCodec from '../PacketCodec.js';

class PlayerPacketIndex {
    /**
     * @public
     * @constructor
     * @param {PacketCodec} codec
     * @param {Array<DemoPacketRaw>} packets
     */
    constructor(codec, packets) {
        Assert.isTrue(codec instanceof PacketCodec, 'Invalid codec: expected an instance of PacketCodec');
        Assert.isTrue(Array.isArray(packets), 'packets must be an array');

        /** @private */
        this._codec = codec;
        /** @private */
        this._packets = packets;

        /** @private @type {Array<number>} */
        this._bootstrap = [];
        /** @private @type {Array<number>} */
        this._keyframes = [];
        /** @private @type {Map<number, *>} */
        this._stringTableSnapshots = new Map();

        /** @private */
        this._uniqueTicks = new Int32Array(0);
        /** @private */
        this._tickOffsets = new Int32Array(0);

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
     * Returns the next tick info from the given cursor position.
     *
     * @public
     * @param {number} position - Current position in the unique ticks index.
     * @returns {{tick: number, count: number, position: number}|null}
     */
    advance(position) {
        const next = position + 1;

        if (next >= this._uniqueTicks.length) {
            return null;
        }

        return {
            tick: this._uniqueTicks[next],
            count: this._tickOffsets[next + 1] - this._tickOffsets[next],
            position: next
        };
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
     * Returns the packets and string table snapshots to replay up to the specified tick.
     *
     * @public
     * @param {number} tick
     * @returns {{bootstrap: Array<number>, snapshots: Array<*>, from: number, to: number}}
     */
    getSeekPlan(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        const keyframeIndex = this._findKeyframeBefore(tick);
        const afterTickPosition = this._findTickPositionAfter(tick);

        const from = keyframeIndex !== undefined ? keyframeIndex : 0;
        const to = afterTickPosition !== -1 ? this._tickOffsets[afterTickPosition] : this._packets.length;

        const keyframePosition = this._keyframes.indexOf(keyframeIndex);

        const snapshots = this._keyframes
            .slice(0, keyframePosition + 1)
            .map(index => this._stringTableSnapshots.get(index))
            .filter(snapshot => snapshot !== undefined);

        return {
            bootstrap: this._bootstrap.slice(),
            snapshots,
            from,
            to
        };
    }

    /**
     * Returns the position of the given tick in the unique ticks index.
     *
     * @public
     * @param {number} tick
     * @returns {number} Position in _uniqueTicks, or -1 if not found.
     */
    getTickPosition(tick) {
        Assert.isTrue(Number.isInteger(tick), 'tick must be an integer');

        let left = 0;
        let right = this._uniqueTicks.length;

        while (left < right) {
            const mid = (left + right) >>> 1;

            if (this._uniqueTicks[mid] < tick) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        if (left >= this._uniqueTicks.length || this._uniqueTicks[left] !== tick) {
            return -1;
        }

        return left;
    }

    /**
     * Returns the previous tick info from the given cursor position.
     *
     * @public
     * @param {number} position - Current position in the unique ticks index.
     * @returns {{tick: number, position: number}|null}
     */
    retreat(position) {
        const prev = position - 1;

        if (prev < 0) {
            return null;
        }

        return {
            tick: this._uniqueTicks[prev],
            position: prev
        };
    }

    /**
     * Builds the keyframe index and unique tick lookup tables.
     *
     * @protected
     */
    _build() {
        const uniqueTicks = [];
        const tickOffsets = [];

        let lastTick = null;

        for (let i = 0; i < this._packets.length; i++) {
            const packet = this._packets[i];
            const typeId = packet.getTypeId();
            const tick = packet.tick.value;

            if (this._codec.getIsBootstrap(packet)) {
                this._bootstrap.push(i);
            }

            if (typeId === DemoPacketType.DEM_FULL_PACKET.id) {
                this._keyframes.push(i);

                const decoded = this._codec.decodeRaw(packet);

                if (decoded === null) {
                    continue;
                }

                this._stringTableSnapshots.set(i, decoded.stringTable);
            }

            if (tick !== lastTick) {
                uniqueTicks.push(tick);
                tickOffsets.push(i);
                lastTick = tick;
            }
        }

        tickOffsets.push(this._packets.length);

        this._uniqueTicks = Int32Array.from(uniqueTicks);
        this._tickOffsets = Int32Array.from(tickOffsets);
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
     * Finds the first position in _uniqueTicks with a tick strictly greater than the specified tick.
     *
     * @protected
     * @param {number} tick
     * @returns {number} Position in _uniqueTicks, or -1 if not found.
     */
    _findTickPositionAfter(tick) {
        let left = 0;
        let right = this._uniqueTicks.length;

        while (left < right) {
            const mid = (left + right) >>> 1;

            if (this._uniqueTicks[mid] <= tick) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left < this._uniqueTicks.length ? left : -1;
    }
}

export default PlayerPacketIndex;
