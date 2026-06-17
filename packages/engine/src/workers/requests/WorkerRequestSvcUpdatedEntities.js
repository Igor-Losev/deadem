/** @import SchemaRegistry from '#root/src/SchemaRegistry.js' */

/** @import { MessagePacketObject } from '#data/MessagePacket.js' */

/** @import { WorkerRequestRaw } from '#workers/requests/WorkerRequest.js' */

import MessagePacket from '#data/MessagePacket.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestSvcUpdatedEntities extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        const minified = new MessagePacket(messagePacket.type, {
            entityData: messagePacket.data.entityData,
            updatedEntries: messagePacket.data.updatedEntries
        });

        super(WorkerMessageType.SVC_UPDATED_ENTITIES, minified, [ ]);
    }

    /**
     * @public
     * @static
     * @param {MessagePacketObject} raw
     * @param {SchemaRegistry} registry
     * @returns {WorkerRequestSvcUpdatedEntities}
     */
    static deserialize(raw, registry) {
        return new WorkerRequestSvcUpdatedEntities(MessagePacket.fromObject(raw, registry));
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload.toObject());
    }
}

export default WorkerRequestSvcUpdatedEntities;
