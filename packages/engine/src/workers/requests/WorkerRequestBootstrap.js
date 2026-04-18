import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestBootstrap extends WorkerRequest {
    /**
     * @constructor
     * @param {Object} protoSchema
     */
    constructor(protoSchema) {
        super(WorkerMessageType.BOOTSTRAP, protoSchema, []);
    }

    /**
     * @public
     * @static
     * @param {Object} protoSchema
     * @returns {WorkerRequestBootstrap}
     */
    static deserialize(protoSchema) {
        return new WorkerRequestBootstrap(protoSchema);
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerRequestBootstrap;
