import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseBootstrap extends WorkerResponse {
    /**
     * @constructor
     */
    constructor() {
        super(WorkerMessageType.BOOTSTRAP, null, []);
    }

    /**
     * @public
     * @static
     * @returns {WorkerResponseBootstrap}
     */
    static deserialize() {
        return new WorkerResponseBootstrap();
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseBootstrap;
