'use strict';

const DemoPacket = require('./../../data/DemoPacket'),
    MessagePacket = require('./../../data/MessagePacket');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const WorkerRequestDHPParse = require('./../requests/WorkerRequestDHPParse'),
    WorkerRequestDPacketSync = require('./../requests/WorkerRequestDPacketSync'),
    WorkerRequestMPacketSync = require('./../requests/WorkerRequestMPacketSync'),
    WorkerRequestSvcPacketEntities = require('./../requests/WorkerRequestSvcPacketEntities');

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
        } else if (instance instanceof WorkerRequestDPacketSync) {
            return {
                type: instance.type.code,
                payload: instance.payload.toObject()
            };
        } else if (instance instanceof WorkerRequestMPacketSync) {
            return {
                type: instance.type.code,
                payload: instance.payload.toObject()
            };
        } else if (instance instanceof WorkerRequestSvcPacketEntities) {
            return {
                type: instance.type.code,
                payload: instance.payload.toObject()
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
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                return new WorkerRequestDHPParse(object.payload);
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                const demoPacket = DemoPacket.fromObject(object.payload);

                return new WorkerRequestDPacketSync(demoPacket);
            }
            case WorkerMessageType.MESSAGE_PACKET_SYNC: {
                const messagePacket = MessagePacket.fromObject(object.payload);

                return new WorkerRequestMPacketSync(messagePacket);
            }
            case WorkerMessageType.SVC_PACKET_ENTITIES: {
                const messagePacket = MessagePacket.fromObject(object.payload);

                return new WorkerRequestSvcPacketEntities(messagePacket);
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
