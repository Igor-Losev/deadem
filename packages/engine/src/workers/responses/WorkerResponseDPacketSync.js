import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.DEMO_PACKET_SYNC, null, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseDPacketSync}
     */
    static deserialize() {
        return new WorkerResponseDPacketSync();
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseDPacketSync;
