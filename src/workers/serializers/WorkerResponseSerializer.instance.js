'use strict';

const MessagePacketRaw = require('./../../data/MessagePacketRaw');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const WorkerResponseDClassInfo = require('./../responses/WorkerResponseDClassInfo'),
    WorkerResponseDHPParse = require('./../responses/WorkerResponseDHPParse'),
    WorkerResponseDSendTables = require('./../responses/WorkerResponseDSendTables');

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
        if (instance instanceof WorkerResponseDClassInfo) {
            return {
                type: instance.type.code
            };
        } else if (instance instanceof WorkerResponseDSendTables) {
            return {
                type: instance.type.code
            };
        } else if (instance instanceof WorkerResponseDHPParse) {
            return {
                type: instance.type.code,
                payload: instance.payload.map((batch) => {
                    return batch.map((messagePacketRaw) => {
                        return [ messagePacketRaw.type, messagePacketRaw.size, messagePacketRaw.payload ];
                    });
                })
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
            case WorkerMessageType.DEMO_CLASS_INFO: {
                return new WorkerResponseDClassInfo();
            }
            case WorkerMessageType.DEMO_SEND_TABLES: {
                return new WorkerResponseDSendTables();
            }
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                const batches = object.payload.map((batch) => {
                   return batch.map((values) => {
                       const [ type, size, payload ] = values;

                       return new MessagePacketRaw(type, size, payload);
                   });
                });

                return new WorkerResponseDHPParse(batches);
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
