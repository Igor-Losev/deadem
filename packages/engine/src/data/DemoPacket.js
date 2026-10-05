/** @import SchemaRegistry from '../SchemaRegistry.js' */
/** @import { DemoPacketHeavyData } from '../PacketCodec.js' */
/** @import { MessagePayload } from './MessagePacket.js' */

import Assert from '../core/Assert.js';

import DemoPacketType from './enums/DemoPacketType.js';

/**
 * @template [M=null]
 * @template {string|null} [N=string|null]
 */
class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {DemoPacketType<N>} type
     * @param {number} tick
     * @param {*} data
     */
    constructor(sequence, type, tick, data) {
        Assert.isTrue(Number.isInteger(sequence));
        Assert.isTrue(type instanceof DemoPacketType);
        Assert.isTrue(Number.isInteger(tick));

        /** @private */
        this._sequence = sequence;
        /** @private */
        this._ordinal = sequence;
        /** @private */
        this._type = type;
        /** @private */
        this._tick = tick;
        /** @private */
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
     * @returns {DemoPacketType<N>}
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
     * @returns {DemoPayload<M, N>}
     */
    get data() {
        return this._data;
    }

    /**
     * @public
     * @template {string|null} T
     * @param {DemoPacketType<T>} type
     * @returns {this is DemoPacket<M, T>}
     */
    is(type) {
        return this._type.id === type.id;
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
     * @returns {boolean}
     */
    getIsSnapshot() {
        return this._type === DemoPacketType.DEM_FULL_PACKET;
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
 * @typedef {{sequence: number, type: string, tick: number, data: *}} DemoPacketObject
 */

/**
 * @template M, N
 * @typedef {M extends null ? * : N extends 'CDemoPacket'|'CDemoFullPacket' ? DemoPacketHeavyData<M> : MessagePayload<M, N>} DemoPayload
 */

export default DemoPacket;
