import WorkerResponse from './WorkerResponse.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerResponseMPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, null, [ ]);
    }
}

export default WorkerResponseMPacketSync;
