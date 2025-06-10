import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';
import WorkerRequestSvcUpdatedEntities from './WorkerRequestSvcUpdatedEntities.js';

class WorkerRequestSvcUpdatedEntitiesBatch extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<WorkerRequestSvcUpdatedEntities>} requests
     */
    constructor(requests) {
        super(WorkerMessageType.SVC_UPDATED_ENTITIES_BATCH, requests, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Array<MessagePacketObject>} raws
     * @returns {WorkerRequestSvcUpdatedEntitiesBatch}
     */
    static deserialize(raws) {
        const requests = raws.map(raw => WorkerRequestSvcUpdatedEntities.deserialize(raw.payload));

        return new WorkerRequestSvcUpdatedEntitiesBatch(requests);
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload.map(request => request.serialize()));
    }
}

export default WorkerRequestSvcUpdatedEntitiesBatch;
