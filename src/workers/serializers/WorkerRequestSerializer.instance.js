import DemoPacket from './../../data/DemoPacket.js';
import MessagePacket from './../../data/MessagePacket.js';

import WorkerMessageType from './../../data/enums/WorkerMessageType.js';

import WorkerRequestDHPParse from './../requests/WorkerRequestDHPParse.js';
import WorkerRequestDPacketSync from './../requests/WorkerRequestDPacketSync.js';
import WorkerRequestMPacketSync from './../requests/WorkerRequestMPacketSync.js';
import WorkerRequestSvcPacketEntities from './../requests/WorkerRequestSvcPacketEntities.js';

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

export default WorkerRequestSerializer.instance;
