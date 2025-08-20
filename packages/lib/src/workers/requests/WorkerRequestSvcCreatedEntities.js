import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestSvcCreatedEntities extends WorkerRequest {
    /**
     * @public
     * @param {Uint32Array} payload
     */
    constructor(payload) {
        super(WorkerMessageType.SVC_CREATED_ENTITIES, payload, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Uint32Array} payload
     * @returns {WorkerRequestSvcCreatedEntities}
     */
    static deserialize(payload) {
        return new WorkerRequestSvcCreatedEntities(payload);
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerRequestSvcCreatedEntities;
