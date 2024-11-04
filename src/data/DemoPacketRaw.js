'use strict';

const UVarInt32 = require('./UVarInt32');

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

    /**
     * Parses first packet from the given buffer.
     *
     * @public
     * @static
     * @param {Buffer} buffer
     * @returns {DemoPacketRaw|null}
     */
    static parse(buffer) {
        const command = UVarInt32.parse(buffer);

        if (command === null) {
            throw new Error('Unable to parse command');
        }

        const tick = UVarInt32.parse(buffer.subarray(command.size));

        if (tick === null) {
            throw new Error('Unable to parse tick');
        }

        const frame = UVarInt32.parse(buffer.subarray(command.size + tick.size));

        if (frame === null) {
            throw new Error('Unable to parse frame');
        }

        const payload = buffer.subarray(command.size + tick.size + frame.size, command.size + tick.size + frame.size + frame.value);

        if (payload.length < frame.value) {
            return null;
        }

        return new DemoPacketRaw(command, tick, frame, payload);
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
