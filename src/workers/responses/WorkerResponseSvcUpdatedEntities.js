import EntityMutationPartialEvent from '#data/entity/EntityMutationPartialEvent.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseSvcUpdatedEntities extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<EntityMutationPartialEvent>} events
     */
    constructor(events) {
        super(WorkerMessageType.SVC_UPDATED_ENTITIES, events, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseSvcUpdatedEntities}
     */
    static deserialize(payload) {
        const events = payload.data.map((mutations, index) => {
            const bitPointer = payload.meta[index * 3];
            const entityIndex = payload.meta[index * 3 + 1];
            const entityClassId = payload.meta[index * 3 + 2];

            return new EntityMutationPartialEvent(bitPointer, entityIndex, entityClassId, mutations);
        });

        return new WorkerResponseSvcUpdatedEntities(events);
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        const data = [ ];
        const meta = new Uint32Array(this._payload.length * 3);

        this._payload.forEach((event, index) => {
            meta[index * 3] = event.bitPointer;
            meta[index * 3 + 1] = event.entityIndex;
            meta[index * 3 + 2] = event.entityClassId;

            data.push(event.mutations);
        });

        return super._serialize({ data, meta });
    }
}

export default WorkerResponseSvcUpdatedEntities;
