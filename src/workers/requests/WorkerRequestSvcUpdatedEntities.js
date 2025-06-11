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
     * @returns {WorkerRequestSvcUpdatedEntities}
     */
    static deserialize(raw) {
        return new WorkerRequestSvcUpdatedEntities(MessagePacket.fromObject(raw));
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
