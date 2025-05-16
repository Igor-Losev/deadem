'use strict';

const assert = require('assert/strict');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

class WorkerRequest {
    /**
     * @abstract
     * @constructor
     * @param {WorkerMessageType} type
     * @param {*} payload
     * @param {Transferable[]} transfers
     */
    constructor(type, payload, transfers) {
        assert(type instanceof WorkerMessageType);

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

module.exports = WorkerRequest;
