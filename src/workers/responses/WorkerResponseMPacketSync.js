import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseMPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, null, [ ]);
    }
}

export default WorkerResponseMPacketSync;
