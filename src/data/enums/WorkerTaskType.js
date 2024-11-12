const assert = require('node:assert/strict');

const registry = {
    byCode: new Map()
};

class WorkerTaskType {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {String} description
     */
    constructor(code, description) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof description === 'string' && description.length > 0);

        this._code = code;
        this._description = description;

        registry.set(code, this);
    }

    get code() {
        return this._code;
    }

    get description() {
        return this._description;
    }

    static DEMO_PACKET_PARSE = new WorkerTaskType('DEMO_PACKET_PARSE', 'Packet Parse');

    static parse(code) {
        return registry.get(code) || null;
    }
}

module.exports = WorkerTaskType;
