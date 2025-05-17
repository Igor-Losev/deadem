'use strict';

const WorkerResponse = require('./WorkerResponse');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerResponseSvcPacketEntities extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.SVC_PACKET_ENTITIES, null, [ ]);
    }
}

module.exports = WorkerResponseSvcPacketEntities;
