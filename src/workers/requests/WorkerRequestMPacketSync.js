'use strict';

const WorkerRequest = require('./WorkerRequest');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequestMPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, messagePacket, [ ]);
    }
}

module.exports = WorkerRequestMPacketSync;
