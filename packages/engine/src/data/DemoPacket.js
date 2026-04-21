import Assert from '#core/Assert.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';

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
        Assert.isTrue(Number.isInteger(sequence));
        Assert.isTrue(type instanceof DemoPacketType);
        Assert.isTrue(Number.isInteger(tick));

        this._sequence = sequence;
        this._ordinal = sequence;
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
     * @returns {number}
     */
    get ordinal() {
        return this._ordinal;
    }

    /**
     * @public
     * @param {number} value
     */
    set ordinal(value) {
        this._ordinal = value;
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

    /**
     * @public
     * @static
     * @param {DemoPacketObject} raw
     * @param {SchemaRegistry} registry
     * @returns {DemoPacket}
     */
    static fromObject(raw, registry) {
        const type = registry.resolveDemoTypeByCode(raw.type);

        if (type === null) {
            throw new Error(`Unknown DemoPacketType [ ${raw.type} ]`);
        }

        return new DemoPacket(raw.sequence, type, raw.tick, raw.data);
    }
}

/**
 * @typedef {{sequence: number, type: String, tick: number, data: *}} DemoPacketObject
 */

export default DemoPacket;
