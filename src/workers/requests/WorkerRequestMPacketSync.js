import WorkerRequest from './WorkerRequest.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerRequestMPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, messagePacket, [ ]);
    }
}

export default WorkerRequestMPacketSync;
