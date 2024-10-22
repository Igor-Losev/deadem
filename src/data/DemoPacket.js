'use strict';

const MAX_UInt32 = 4294967295;

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} command
     * @param {number} tick
     * @param {*} data
     */
    constructor(command, tick, data) {
        this._command = command;
        this._tick = tick;
        this._data = data;
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
     * @public
     * @static
     *
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {*} data
     */
    static fromRaw(demoPacketRaw, data) {
        const command = demoPacketRaw.getCommandType();

        let tick;

        if (demoPacketRaw.tick.value === MAX_UInt32) {
            tick = 0;
        } else {
            tick = demoPacketRaw.tick.value;
        }

        return new DemoPacket(command, tick, data);
    }
}

module.exports = DemoPacket;
