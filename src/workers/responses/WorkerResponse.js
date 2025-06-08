import Assert from '#core/Assert.js';
import Serializable from '#core/Serializable.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

class WorkerResponse extends Serializable {
    /**
     * @abstract
     * @constructor
     * @param {WorkerMessageType} type
     * @param {*} payload
     * @param {Transferable[]} transfers
     */
    constructor(type, payload, transfers) {
        super();

        Assert.isTrue(type instanceof WorkerMessageType);

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

    /**
     * @protected
     * @param {*} payload
     * @returns {WorkerResponseRaw}
     */
    _serialize(payload) {
        return {
            __type: this._type.code,
            payload
        };
    }
}

/**
 * @typedef {{ __type: String, payload: * }} WorkerResponseRaw
 */

export default WorkerResponse;
