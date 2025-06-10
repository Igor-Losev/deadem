import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';
import WorkerResponseSvcUpdatedEntities from './WorkerResponseSvcUpdatedEntities.js';

class WorkerResponseSvcUpdatedEntitiesBatch extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<WorkerResponseSvcUpdatedEntities>} responses
     */
    constructor(responses) {
        super(WorkerMessageType.SVC_UPDATED_ENTITIES_BATCH, responses, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseSvcUpdatedEntitiesBatch}
     */
    static deserialize(raws) {
        const responses = raws.map(raw => WorkerResponseSvcUpdatedEntities.deserialize(raw.payload));

        return new WorkerResponseSvcUpdatedEntitiesBatch(responses);
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload.map(response => response.serialize()));
    }
}

export default WorkerResponseSvcUpdatedEntitiesBatch;
