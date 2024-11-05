'use strict';

const assert = require('assert/strict');

const DemoCommandType = require('./../data/enums/DemoCommandType');

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {DemoCommandType} command
     * @param {Number} tick
     * @param {*} data
     */
    constructor(command, tick, data) {
        assert(command instanceof DemoCommandType);
        assert(Number.isInteger(tick));

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
}

module.exports = DemoPacket;
