import Assert from './../../core/Assert.js';

import WorkerMessageType from './../../data/enums/WorkerMessageType.js';

class WorkerRequest {
    /**
     * @abstract
     * @constructor
     * @param {WorkerMessageType} type
     * @param {*} payload
     * @param {Transferable[]} transfers
     */
    constructor(type, payload, transfers) {
        Assert.isTrue(type instanceof WorkerMessageType)

        this._type = type;
        this._payload = payload;
        this._transfers = transfers;
    }

    /**
     * @returns {WorkerMessageType}
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {*}
     */
    get payload() {
        return this._payload;
    }

    /**
     * @returns {Transferable[]}
     */
    get transfers() {
        return this._transfers;
    }
}

export default WorkerRequest;
