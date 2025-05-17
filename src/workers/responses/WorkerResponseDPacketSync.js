'use strict';

const WorkerResponse = require('./WorkerResponse');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerResponseDPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_PACKET_SYNC, null, [ ]);
    }
}

module.exports = WorkerResponseDPacketSync;
