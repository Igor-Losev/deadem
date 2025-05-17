'use strict';

const WorkerRequest = require('./WorkerRequest');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequestDPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {DemoPacket} demoPacket
     */
    constructor(demoPacket) {
        super(WorkerMessageType.DEMO_PACKET_SYNC, demoPacket, [ ]);
    }
}

module.exports = WorkerRequestDPacketSync;
