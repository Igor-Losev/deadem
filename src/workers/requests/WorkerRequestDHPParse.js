'use strict';

const WorkerRequest = require('./WorkerRequest');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequestDHPParse extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<Buffer>} buffers
     */
    constructor(buffers) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, buffers, [ ]);
    }
}

module.exports = WorkerRequestDHPParse;
