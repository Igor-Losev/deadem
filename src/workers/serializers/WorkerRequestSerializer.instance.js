'use strict';

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const WorkerRequestDHPParse = require('./../../workers/requests/WorkerRequestDHPParse');

class WorkerRequestSerializer {
    constructor() {

    }

    static instance = new WorkerRequestSerializer();

    /**
     * @public
     * @param {SerializableRequest} instance
     * @returns {Object}
     */
    serialize(instance) {
        if (instance instanceof WorkerRequestDHPParse) {
            return {
                type: instance.type.code,
                payload: instance.payload
            };
        } else {
            throw new Error(`Unable to serialize instance [ ${instance} ]`);
        }
    }

    /**
     * @public
     * @param {Object} object
     * @returns {SerializableRequest}
     */
    deserialize(object) {
        const type = WorkerMessageType.parse(object.type);

        if (type === null) {
            throw new Error(`Unknown type [ ${object.type} ]`);
        }

        switch (type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE:
                return new WorkerRequestDHPParse(object.payload);

            default:
                throw new Error(`Unable to deserialize object [ ${object.type} ]`);
        }
    }
}

/**
 * @typedef {WorkerRequest} SerializableRequest
 */

module.exports = WorkerRequestSerializer.instance;
