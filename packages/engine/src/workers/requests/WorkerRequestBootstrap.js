/** @import { WorkerRequestRaw } from '#workers/requests/WorkerRequest.js' */

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestBootstrap extends WorkerRequest {
    /**
     * @constructor
     * @param {object} registrySnapshot
     */
    constructor(registrySnapshot) {
        super(WorkerMessageType.BOOTSTRAP, { registrySnapshot }, []);
    }

    /**
     * @public
     * @static
     * @param {{registrySnapshot: object}} payload
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
