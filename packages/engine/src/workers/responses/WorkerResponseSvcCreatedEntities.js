import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseSvcCreatedEntities extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.SVC_CREATED_ENTITIES, null, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseSvcCreatedEntities}
     */
    static deserialize() {
        return new WorkerResponseSvcCreatedEntities();
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseSvcCreatedEntities;
