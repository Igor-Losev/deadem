import Assert from '#core/Assert.js';

import DemoPacketType from './enums/DemoPacketType.js';

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {DemoPacketType} type
     * @param {number} tick
     * @param {*} data
     */
    constructor(sequence, type, tick, data) {
        Assert.isTrue(type instanceof DemoPacketType);
        Assert.isTrue(Number.isInteger(tick));

        this._sequence = sequence;
        this._type = type;
        this._tick = tick;
        this._data = data;
    }

    /**
     * @public
     * @returns {number}
     */
    get sequence() {
        return this._sequence;
    }

    /**
     * @public
     * @returns {DemoPacketType}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {number}
     */
    get tick() {
        return this._tick;
    }

    /**
     * @public
     * @returns {*}
     */
    get data() {
        return this._data;
    }

    /**
     * @static
     * @public
     * @param {DemoPacketObject} object
     * @returns {DemoPacket}
     */
    static fromObject(object) {
        return new DemoPacket(
            object.sequence,
            DemoPacketType.parse(object.type),
            object.tick,
            object.data
        );
    }

    /**
     * Determines whether this is the initial packet at the start of the demo.
     *
     * In Source 2 demos, the initial packet typically contains the baseline state
     * of the world or entities before any updates occur.
     *
     * @public
     * @returns {boolean} `true` if this is the initial demo packet (tick === -1).
     */
    getIsInitial() {
        return this._tick === -1;
    }

    /**
     * @public
     * @returns {DemoPacketObject}
     */
    toObject() {
        return {
            sequence: this._sequence,
            type: this._type.code,
            tick: this._tick,
            data: this._data
        };
    }
}

/**
 * @typedef {{sequence: number, type: String, tick: number, data: *}} DemoPacketObject
 */

export default DemoPacket;
