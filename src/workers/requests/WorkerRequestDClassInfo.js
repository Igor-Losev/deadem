'use strict';

const WorkerRequest = require('./WorkerRequest');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequestDClassInfo extends WorkerRequest {
    /**
     * @constructor
     * @param {DemoPacket} demoPacket
     */
    constructor(demoPacket) {
        super(WorkerMessageType.DEMO_CLASS_INFO, demoPacket, [ ]);
    }
}

module.exports = WorkerRequestDClassInfo;
