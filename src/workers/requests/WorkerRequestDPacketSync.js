import DemoPacket from '#data/DemoPacket.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDPacketSync extends WorkerRequest {
    /**
     * @constructor
     * @param {DemoPacket} demoPacket
     */
    constructor(demoPacket) {
        super(WorkerMessageType.DEMO_PACKET_SYNC, demoPacket, [ ]);
    }

    /**
     * @public
     * @static
     * @param {DemoPacketObject} raw
     * @returns {WorkerRequestDPacketSync}
     */
    static deserialize(raw) {
        return new WorkerRequestDPacketSync(DemoPacket.fromObject(raw));
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload.toObject());
    }
}

export default WorkerRequestDPacketSync;
