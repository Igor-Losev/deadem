import WorkerResponse from './WorkerResponse.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerResponseSvcPacketEntities extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.SVC_PACKET_ENTITIES, null, [ ]);
    }
}

export default WorkerResponseSvcPacketEntities;
