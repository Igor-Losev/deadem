import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequestDHPParse from '#workers/requests/WorkerRequestDHPParse.js';
import WorkerRequestDPacketSync from '#workers/requests/WorkerRequestDPacketSync.js';
import WorkerRequestMPacketSync from '#workers/requests/WorkerRequestMPacketSync.js';
import WorkerRequestSvcCreatedEntities from '#workers/requests/WorkerRequestSvcCreatedEntities.js';
import WorkerRequestSvcUpdatedEntities from '#workers/requests/WorkerRequestSvcUpdatedEntities.js';
import WorkerRequestSvcUpdatedEntitiesBatch from '#workers/requests/WorkerRequestSvcUpdatedEntitiesBatch.js';

import WorkerResponseDHPParse from '#workers/responses/WorkerResponseDHPParse.js';
import WorkerResponseDPacketSync from '#workers/responses/WorkerResponseDPacketSync.js';
import WorkerResponseMPacketSync from '#workers/responses/WorkerResponseMPacketSync.js';
import WorkerResponseSvcCreatedEntities from '#workers/responses/WorkerResponseSvcCreatedEntities.js';
import WorkerResponseSvcUpdatedEntities from '#workers/responses/WorkerResponseSvcUpdatedEntities.js';
import WorkerResponseSvcUpdatedEntitiesBatch from '#workers/responses/WorkerResponseSvcUpdatedEntitiesBatch.js';

const workerRequests = new Map();

workerRequests.set(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE.code, WorkerRequestDHPParse);
workerRequests.set(WorkerMessageType.DEMO_PACKET_SYNC.code, WorkerRequestDPacketSync);
workerRequests.set(WorkerMessageType.MESSAGE_PACKET_SYNC.code, WorkerRequestMPacketSync);
workerRequests.set(WorkerMessageType.SVC_CREATED_ENTITIES.code, WorkerRequestSvcCreatedEntities);
workerRequests.set(WorkerMessageType.SVC_UPDATED_ENTITIES.code, WorkerRequestSvcUpdatedEntities);
workerRequests.set(WorkerMessageType.SVC_UPDATED_ENTITIES_BATCH.code, WorkerRequestSvcUpdatedEntitiesBatch);

const workerResponses = new Map();

workerResponses.set(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE.code, WorkerResponseDHPParse);
workerResponses.set(WorkerMessageType.DEMO_PACKET_SYNC.code, WorkerResponseDPacketSync);
workerResponses.set(WorkerMessageType.MESSAGE_PACKET_SYNC.code, WorkerResponseMPacketSync);
workerResponses.set(WorkerMessageType.SVC_CREATED_ENTITIES.code, WorkerResponseSvcCreatedEntities);
workerResponses.set(WorkerMessageType.SVC_UPDATED_ENTITIES.code, WorkerResponseSvcUpdatedEntities);
workerResponses.set(WorkerMessageType.SVC_UPDATED_ENTITIES_BATCH.code, WorkerResponseSvcUpdatedEntitiesBatch);

/**
 * This class exists to avoid circular dependencies
 * between {@link WorkerMessageType} and WorkerRequests/WorkerResponses.
 */
class WorkerMessageBridge {
    constructor() {

    }

    static instance = new WorkerMessageBridge();

    /**
     * @public
     * @param {WorkerRequestRaw} requestRaw
     * @returns {typeof WorkerRequest}
     */
    resolveRequestClass(requestRaw) {
        const clazz = workerRequests.get(requestRaw.__type) || null;

        if (clazz === null) {
            throw new Error(`Unknown request [ ${requestRaw.__type} ]`);
        }

        return clazz;
    }

    /**
     * @public
     * @param {WorkerResponseRaw} responseRaw
     * @returns {typeof WorkerResponse}
     */
    resolveResponseClass(responseRaw) {
        const clazz = workerResponses.get(responseRaw.__type) || null;

        if (clazz === null) {
            throw new Error(`Unknown response [ ${responseRaw.__type} ]`);
        }

        return clazz;
    }
}

export default WorkerMessageBridge.instance;
