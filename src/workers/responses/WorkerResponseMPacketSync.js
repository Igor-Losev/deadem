'use strict';

const WorkerResponse = require('./WorkerResponse');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerResponseMPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, null, [ ]);
    }
}

module.exports = WorkerResponseMPacketSync;
