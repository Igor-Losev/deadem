'use strict';

class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {UVarInt32} command
     * @param {UVarInt32} tick
     * @param {UVarInt32} frame
     * @param {Buffer} payload
     */
    constructor(sequence, command, tick, frame, payload) {
        this._sequence = sequence;
        this._command = command;
        this._tick = tick;
        this._frame = frame;
        this._payload = payload;
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

    get frame() {
        return this._frame;
    }

    get payload() {
        return this._payload;
    }

    /**
     * @public
     * @returns {number}
     */
    getCommandType() {
        return this._command.value & ~64;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsCompressed() {
        return (this._command.value & 64) === 64;
    }

    /**
     * @public
     * @returns {number}
     */
    getSize() {
        return this._command.size + this._tick.size + this._frame.size + this._payload.length;
    }
}

module.exports = DemoPacketRaw;
