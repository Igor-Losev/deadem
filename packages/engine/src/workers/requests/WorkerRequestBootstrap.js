import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestBootstrap extends WorkerRequest {
    /**
     * @constructor
     * @param {Object} registrySnapshot
     */
    constructor(registrySnapshot) {
        super(WorkerMessageType.BOOTSTRAP, { registrySnapshot }, []);
    }

    /**
     * @public
     * @static
     * @param {{registrySnapshot: Object}} payload
     * @returns {WorkerRequestBootstrap}
     */
    static deserialize(payload) {
        return new WorkerRequestBootstrap(payload.registrySnapshot);
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
