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

    get sequence() {
        return this._sequence;
    }

    get command() {
        return this._command;
    }

    get tick() {
        return this._tick;
    }

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
