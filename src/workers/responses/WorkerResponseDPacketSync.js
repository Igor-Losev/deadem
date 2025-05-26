import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_PACKET_SYNC, null, [ ]);
    }
}

export default WorkerResponseDPacketSync;
