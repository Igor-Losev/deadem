import Assert from '#core/Assert.js';

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
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof description === 'string' && description.length > 0);

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
    static get SVC_CREATED_ENTITIES() {
        return svcCreatedEntities;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get SVC_UPDATED_ENTITIES() {
        return svcUpdatedEntities;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get SVC_UPDATED_ENTITIES_BATCH() {
        return svcUpdatedEntitiesBatch;
    }
}

const demoHeavyPacketParse = new WorkerMessageType('DEMO_HEAVY_PACKET_PARSE', 'Parsing heavy demo packets');
const demoPacketSync = new WorkerMessageType('DEMO_PACKET_SYNC', 'Synchronize demo packet');

const messagePacketSync = new WorkerMessageType('MESSAGE_PACKET_SYNC', 'Synchronize message packet');

const svcCreatedEntities = new WorkerMessageType('SVC_CREATED_ENTITIES', 'Parsing SVC_CREATED_ENTITIES message');
const svcUpdatedEntities = new WorkerMessageType('SVC_UPDATED_ENTITIES', 'Parsing SVC_UPDATED_ENTITIES message');
const svcUpdatedEntitiesBatch = new WorkerMessageType('SVC_UPDATED_ENTITIES_BATCH', 'Parsing SVC_UPDATED_ENTITIES_BATCH message');

export default WorkerMessageType;
