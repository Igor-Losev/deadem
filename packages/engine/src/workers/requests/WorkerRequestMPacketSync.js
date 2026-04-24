import MessagePacket from '#data/MessagePacket.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestMPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {MessagePacket} messagePacket
     */
    constructor(messagePacket) {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, messagePacket, [ ]);
    }

    /**
     * @public
     * @static
     * @param {MessagePacketObject} raw
     * @param {SchemaRegistry} registry
     * @returns {WorkerRequestMPacketSync}
     */
    static deserialize(raw, registry) {
        return new WorkerRequestMPacketSync(MessagePacket.fromObject(raw, registry));
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload.toObject());
    }
}

export default WorkerRequestMPacketSync;
