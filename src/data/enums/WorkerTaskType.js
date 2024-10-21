const Enum = require('./Enum');

const registry = new Map();

class WorkerTaskType extends Enum {
    constructor(code, description) {
        super(code, description);

        registry.set(code, this);
    }

    static PACKET_PARSE = new WorkerTaskType('PACKET_PARSE', 'Packet Parse');

    static parse(code) {
        return registry.get(code) || null;
    }
}

module.exports = WorkerTaskType;
