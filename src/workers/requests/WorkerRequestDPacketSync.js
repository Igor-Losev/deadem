import WorkerRequest from './WorkerRequest.js';

import WorkerMessageType from './../../data/enums/WorkerMessageType.js';

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
