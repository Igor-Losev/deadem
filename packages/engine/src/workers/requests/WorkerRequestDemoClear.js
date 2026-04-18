import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDemoClear extends WorkerRequest {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_CLEAR, null, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerRequestDemoClear}
     */
    static deserialize() {
        return new WorkerRequestDemoClear();
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerRequestDemoClear;
