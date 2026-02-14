import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDemoClear extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_CLEAR, null, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseDemoClear}
     */
    static deserialize() {
        return new WorkerResponseDemoClear();
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseDemoClear;
