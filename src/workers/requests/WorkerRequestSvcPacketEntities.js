import WorkerRequest from './WorkerRequest.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerRequestSvcPacketEntities extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        super(WorkerMessageType.SVC_PACKET_ENTITIES, messagePacket, [ ]);
    }
}

export default WorkerRequestSvcPacketEntities;
