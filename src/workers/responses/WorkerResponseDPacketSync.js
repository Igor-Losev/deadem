import WorkerResponse from './WorkerResponse.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerResponseDPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_PACKET_SYNC, null, [ ]);
    }
}

export default WorkerResponseDPacketSync;
