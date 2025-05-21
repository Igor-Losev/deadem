'use strict';

const assert = require('assert/strict');

const DemoCommandType = require('./../data/enums/DemoCommandType');

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {DemoCommandType} command
     * @param {number} tick
     * @param {*} data
     */
    constructor(sequence, command, tick, data) {
        assert(command instanceof DemoCommandType);
        assert(Number.isInteger(tick));

        this._sequence = sequence;
        this._command = command;
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
     * @returns {DemoCommandType}
     */
    get command() {
        return this._command;
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
            DemoCommandType.parse(object.command),
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
            command: this._command.code,
            tick: this._tick,
            data: this._data
        };
    }
}

/**
 * @typedef {{sequence: number, command: String, tick: number, data: *}} DemoPacketObject
 */

module.exports = DemoPacket;
