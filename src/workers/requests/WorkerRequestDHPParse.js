import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDHPParse extends WorkerRequest {
    /**
     * @constructor
     * @param {Array<WorkrerRequestDHPItem>} items
     */
    constructor(items) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, items, [ ]);
    }

    /**
     * @public
     * @static
     * @param {Array<WorkrerRequestDHPItem>} items
     * @returns {WorkerRequestDHPParse}
     */
    static deserialize(items) {
        return new WorkerRequestDHPParse(items);
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

/**
 * @typedef {[number, number, boolean, Buffer]} WorkrerRequestDHPItem
 */

export default WorkerRequestDHPParse;
