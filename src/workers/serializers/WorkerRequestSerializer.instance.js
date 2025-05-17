'use strict';

const DemoPacket = require('./../../data/DemoPacket');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const WorkerRequestDClassInfo = require('./../requests/WorkerRequestDClassInfo'),
    WorkerRequestDHPParse = require('./../requests/WorkerRequestDHPParse'),
    WorkerRequestDSendTables = require('./../requests/WorkerRequestDSendTables');

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
        if (instance instanceof WorkerRequestDClassInfo) {
            return {
                type: instance.type.code,
                payload: instance.payload.toObject()
            };
        } else if (instance instanceof WorkerRequestDSendTables) {
            return {
                type: instance.type.code,
                payload: instance.payload.toObject()
            };
        } else if (instance instanceof WorkerRequestDHPParse) {
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
            case WorkerMessageType.DEMO_CLASS_INFO: {
                const demoPacket = DemoPacket.fromObject(object.payload);

                return new WorkerRequestDClassInfo(demoPacket);
            }
            case WorkerMessageType.DEMO_SEND_TABLES: {
                const demoPacket = DemoPacket.fromObject(object.payload);

                return new WorkerRequestDSendTables(demoPacket);
            }
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                return new WorkerRequestDHPParse(object.payload);
            }
            default:
                throw new Error(`Unable to deserialize object [ ${object.type} ]`);
        }
    }
}

/**
 * @typedef {WorkerRequest} SerializableRequest
 */

module.exports = WorkerRequestSerializer.instance;
