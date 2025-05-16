'use strict';

const WorkerResponse = require('./WorkerResponse');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerResponseDHPParse extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<Array<MessagePacketRaw>>} batches
     */
    constructor(batches) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, batches, [ ]);
    }
}

module.exports = WorkerResponseDHPParse;
