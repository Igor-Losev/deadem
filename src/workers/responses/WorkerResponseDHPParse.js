import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDHPParse extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<Array<MessagePacketRaw>>} batches
     */
    constructor(batches) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, batches, [ ]);
    }
}

export default WorkerResponseDHPParse;
