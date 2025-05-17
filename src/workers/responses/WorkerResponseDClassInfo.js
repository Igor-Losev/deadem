'use strict';

const WorkerResponse = require('./WorkerResponse');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerResponseDClassInfo extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_CLASS_INFO, null, [ ]);
    }
}

module.exports = WorkerResponseDClassInfo;
