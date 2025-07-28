import MessagePacket from '#data/MessagePacket.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestMPacketBatchSync extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<MessagePacket>} batch
     */
    constructor(batch) {
        super(WorkerMessageType.MESSAGE_PACKET_BATCH_SYNC, batch, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Array<MessagePacketObject>} raws
     * @returns {WorkerRequestMPacketBatchSync}
     */
    static deserialize(raws) {
        return new WorkerRequestMPacketBatchSync(raws.map(raw => MessagePacket.fromObject(raw)));
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload.map(messagePacket => messagePacket.toObject()));
    }
}

export default WorkerRequestMPacketBatchSync;
