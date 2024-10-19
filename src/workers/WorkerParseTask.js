'use strict';

class WorkerParseTask {
    /**
     * @public
     * @constructor
     * @param {Number} id
     * @param {Array<DemoPacketRaw>} packets
     */
    constructor(id, packets) {
        this._id = id;
        this._packets = packets;
    }

    get id() {
        return this._id;
    }

    get packets() {
        return this._packets;
    }
}

module.exports = WorkerParseTask;
