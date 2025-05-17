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
    static get DEMO_SEND_TABLES() {
        return demoSendTables;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get DEMO_CLASS_INFO() {
        return demoClassInfo;
    }

    /**
     * @public
     * @static
     * @returns {WorkerMessageType}
     */
    static get DEMO_HEAVY_PACKET_PARSE() {
        return demoHeavyPacketParse;
    }
}

const demoHeavyPacketParse = new WorkerMessageType('DEMO_HEAVY_PACKET_PARSE', 'Parsing heavy demo packets');
const demoSendTables = new WorkerMessageType('DEMO_SEND_TABLES', 'Parsing DEM_SendTables packet');
const demoClassInfo = new WorkerMessageType('DEMO_CLASS_INFO', 'Parsing DEM_ClassInfo packet');

module.exports = WorkerMessageType;
