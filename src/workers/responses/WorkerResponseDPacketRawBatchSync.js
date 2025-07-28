import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDPacketRawBatchSync extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<EntityMutationEventPacked>} events
     */
    constructor(events) {
        super(WorkerMessageType.DEMO_PACKET_RAW_BATCH_SYNC, events, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Array<EntityMutationEventPacked>} raw
     * @returns {WorkerResponseDPacketRawBatchSync}
     */
    static deserialize(raw) {
        return new WorkerResponseDPacketRawBatchSync(raw);
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

/**
 * @typedef {Array<number, number, number, number, Array<*>>} EntityMutationEventPacked
 */

export default WorkerResponseDPacketRawBatchSync;
