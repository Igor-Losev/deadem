import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDHPParse extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<Buffer>} buffers
     */
    constructor(buffers) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, buffers, [ ]);
    }
}

export default WorkerRequestDHPParse;
