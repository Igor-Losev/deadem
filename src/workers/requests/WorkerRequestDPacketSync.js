import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {DemoPacket} demoPacket
     */
    constructor(demoPacket) {
        super(WorkerMessageType.DEMO_PACKET_SYNC, demoPacket, [ ]);
    }
}

export default WorkerRequestDPacketSync;
