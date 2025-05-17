'use strict';

const MessagePacketRaw = require('./../../data/MessagePacketRaw');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const WorkerResponseDHPParse = require('./../responses/WorkerResponseDHPParse'),
    WorkerResponseDPacketSync = require('./../responses/WorkerResponseDPacketSync'),
    WorkerResponseMPacketSync = require('./../responses/WorkerResponseMPacketSync'),
    WorkerResponseSvcPacketEntities = require('./../responses/WorkerResponseSvcPacketEntities');

class WorkerResponseSerializer {
    constructor() {

    }

    static instance = new WorkerResponseSerializer();

    /**
     * @public
     * @param {SerializableResponse} instance
     * @returns {Object}
     */
    serialize(instance) {
        if (instance instanceof WorkerResponseDHPParse) {
            return {
                type: instance.type.code,
                payload: instance.payload.map((batch) => {
                    return batch.map((messagePacketRaw) => {
                        return [ messagePacketRaw.type, messagePacketRaw.size, messagePacketRaw.payload ];
                    });
                })
            };
        } else if (instance instanceof WorkerResponseDPacketSync) {
            return {
                type: instance.type.code
            };
        } else if (instance instanceof WorkerResponseMPacketSync) {
            return {
                type: instance.type.code
            };
        } else if (instance instanceof WorkerResponseSvcPacketEntities) {
            return {
                type: instance.type.code
            };
        } else {
            throw new Error(`Unable to serialize instance [ ${instance} ]`);
        }
    }

    /**
     * @public
     * @param {Object} object
     * @returns {SerializableResponse}
     */
    deserialize(object) {
        const type = WorkerMessageType.parse(object.type);

        if (type === null) {
            throw new Error(`Unknown type [ ${object.type} ]`);
        }

        switch (type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                const batches = object.payload.map((batch) => {
                   return batch.map((values) => {
                       const [ type, size, payload ] = values;

                       return new MessagePacketRaw(type, size, payload);
                   });
                });

                return new WorkerResponseDHPParse(batches);
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                return new WorkerResponseDPacketSync();
            }
            case WorkerMessageType.MESSAGE_PACKET_SYNC: {
                return new WorkerResponseMPacketSync();
            }
            case WorkerMessageType.SVC_PACKET_ENTITIES: {
                return new WorkerResponseSvcPacketEntities();
            }
            default:
                throw new Error(`Unable to deserialize object [ ${object.type} ]`);
        }
    }
}

/**
 * @typedef {WorkerRequest} SerializableResponse
 */

module.exports = WorkerResponseSerializer.instance;
