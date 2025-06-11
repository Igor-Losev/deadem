import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDHPParse extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<Buffer>} buffers
     */
    constructor(buffers) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, buffers, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Array<Buffer>} buffers
     * @returns {WorkerRequestDHPParse}
     */
    static deserialize(buffers) {
        return new WorkerRequestDHPParse(buffers);
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerRequestDHPParse;
