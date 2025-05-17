const assert = require('node:assert/strict');

const registry = {
    byCode: new Map()
};

class WorkerMessageType {
    /**
     * @constructor
     * @param {String} code
     * @param {String} description
     */
    constructor(code, description) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof description === 'string' && description.length > 0);

        this._code = code;
        this._description = description;

        registry.byCode.set(code, this);
    }

    /**
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @returns {String}
     */
    get description() {
        return this._description;
    }

    /**
     * @static
     * @param {String} code
     * @returns {WorkerMessageType|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get DEMO_HEAVY_PACKET_PARSE() {
        return demoHeavyPacketParse;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get DEMO_PACKET_SYNC() {
        return demoPacketSync;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get MESSAGE_PACKET_SYNC() {
        return messagePacketSync;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get SVC_PACKET_ENTITIES() {
        return svcPacketEntities;
    }
}

const demoHeavyPacketParse = new WorkerMessageType('DEMO_HEAVY_PACKET_PARSE', 'Parsing heavy demo packets');
const demoPacketSync = new WorkerMessageType('DEMO_PACKET_SYNC', 'Synchronize demo packet');

const messagePacketSync = new WorkerMessageType('MESSAGE_PACKET_SYNC', 'Synchronize message packet');

const svcPacketEntities = new WorkerMessageType('SVC_PACKET_ENTITIES', 'Parsing SVC_PACKET_ENTITIES message');

module.exports = WorkerMessageType;
