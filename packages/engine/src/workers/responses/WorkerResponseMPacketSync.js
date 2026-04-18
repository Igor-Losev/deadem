import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseMPacketSync extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.MESSAGE_PACKET_SYNC, null, [ ]);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseMPacketSync}
     */
    static deserialize() {
        return new WorkerResponseMPacketSync();
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseMPacketSync;
