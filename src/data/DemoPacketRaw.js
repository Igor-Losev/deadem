'use strict';

class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {UVarInt32} command
     * @param {UVarInt32} tick
     * @param {UVarInt32} frame
     * @param {Buffer} payload
     */
    constructor(command, tick, frame, payload) {
        this._command = command;
        this._tick = tick;
        this._frame = frame;
        this._payload = payload;
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
    getActualSize() {
        return this._command.size + this._tick.size + this._frame.size + this._payload.length;
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
        return getIsCompressed(this._command);
    }

    /**
     * @public
     * @returns {Number}
     */
    getOriginalSize() {
        return this._command.size + this._tick.size + this._frame.size + this._frame.value;
    }
}

/**
 * @param {UVarInt32} command
 * @returns {boolean}
 */
function getIsCompressed(command) {
    return (command.value & 64) === 64;
}

module.exports = DemoPacketRaw;
