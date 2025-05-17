'use strict';

const WorkerRequest = require('./WorkerRequest');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequestSvcPacketEntities extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        super(WorkerMessageType.SVC_PACKET_ENTITIES, messagePacket, [ ]);
    }
}

module.exports = WorkerRequestSvcPacketEntities;
