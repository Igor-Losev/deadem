import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import Demo from '#data/Demo.js';
import Entity from '#data/entity/Entity.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

import WorkerResponseDHPParse from '#workers/responses/WorkerResponseDHPParse.js';
import WorkerResponseDPacketSync from '#workers/responses/WorkerResponseDPacketSync.js';
import WorkerResponseMPacketSync from '#workers/responses/WorkerResponseMPacketSync.js';
import WorkerResponseSvcCreatedEntities from '#workers/responses/WorkerResponseSvcCreatedEntities.js';
import WorkerResponseSvcUpdatedEntities from '#workers/responses/WorkerResponseSvcUpdatedEntities.js';
import WorkerResponseSvcUpdatedEntitiesBatch from '#workers/responses/WorkerResponseSvcUpdatedEntitiesBatch.js';

import WorkerMessageBridge from '#workers/WorkerMessageBridge.instance.js';

class Worker {
    /**
     * @abstract
     * @constructor
     */
    constructor() {
        this._demo = new Demo();

        this._demoMessageHandler = new DemoMessageHandler(this._demo);
        this._demoPacketHandler = new DemoPacketHandler(this._demo);
    }

    /**
     * @protected
     */
    _respond() {
        throw new Error('Worker._respond() is not implemented');
    }

    /**
     * @protected
     * @param {*} requestRaw
     */
    _route(requestRaw) {
        const workerRequestClass = WorkerMessageBridge.resolveRequestClass(requestRaw);

        const request = workerRequestClass.deserialize(requestRaw.payload);

        let response;

        switch (request.type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                response = this._handleHeavyPacketParse(request);

                break;
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                const demoPacket = request.payload;

                switch (demoPacket.type) {
                    case DemoPacketType.DEM_CLASS_INFO:
                        response = this._handleClassInfo(request);

                        break;
                    case DemoPacketType.DEM_SEND_TABLES:
                        response = this._handleSendTables(request);

                        break;
                    case DemoPacketType.DEM_STRING_TABLES:
                        response = this._handleStringTables(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.DEMO_PACKET_SYNC.code} ] [ ${demoPacket.type.code} ]`);
                }

                break;
            }
            case WorkerMessageType.MESSAGE_PACKET_SYNC: {
                const messagePacket = request.payload;

                switch (messagePacket.type) {
                    case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                        response = this._handleSvcClearAllStringTables(request);

                        break;
                    case MessagePacketType.SVC_CREATE_STRING_TABLE:
                        response = this._handleSvcCreateStringTable(request);

                        break;
                    case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                        response = this._handleSvcUpdateStringTable(request);

                        break;
                    case MessagePacketType.SVC_SERVER_INFO:
                        response = this._handleSvcServerInfo(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.MESSAGE_PACKET_SYNC.code} ] [ ${messagePacket.type.code} ]`);
                }

                break;
            }
            case WorkerMessageType.SVC_CREATED_ENTITIES: {
                response = this._handleSvcCreatedEntities(request);

                break;
            }
            case WorkerMessageType.SVC_UPDATED_ENTITIES: {
                response = this._handleSvcUpdatedEntities(request);

                break;
            }
            case WorkerMessageType.SVC_UPDATED_ENTITIES_BATCH: {
                response = this._handleSvcUpdatedEntitiesBatch(request);

                break;
            }
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDHPParse} request
     * @returns {WorkerResponseDHPParse}
     */
    _handleHeavyPacketParse(request) {
        const batches = [ ];

        request.payload.forEach((buffer) => {
            let decompressed;

            try {
                decompressed = SnappyDecompressor.decompress(buffer);
            } catch {
                decompressed = buffer;
            }

            const decoded = DemoPacketType.DEM_PACKET.proto.decode(decompressed);

            const extractor = new MessagePacketRawExtractor(decoded.data);

            const packed = extractor.allPacked();

            batches.push(packed);
        });

        return new WorkerResponseDHPParse(batches);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     * @returns {WorkerResponseDPacketSync}
     */
    _handleClassInfo(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemClassInfo(demoPacket);

        return new WorkerResponseDPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     * @returns {WorkerResponseDPacketSync}
     */
    _handleSendTables(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemSendTables(demoPacket);

        return new WorkerResponseDPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     * @returns {WorkerResponseDPacketSync}
     */
    _handleStringTables(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemStringTables(demoPacket);

        return new WorkerResponseDPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     * @returns {WorkerResponseMPacketSync}
     */
    _handleSvcClearAllStringTables(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

        return new WorkerResponseMPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     * @returns {WorkerResponseMPacketSync}
     */
    _handleSvcCreateStringTable(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

        return new WorkerResponseMPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     * @returns {WorkerResponseMPacketSync}
     */
    _handleSvcUpdateStringTable(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

        return new WorkerResponseMPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     * @returns {WorkerResponseMPacketSync}
     */
    _handleSvcServerInfo(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcServerInfo(messagePacket);

        return new WorkerResponseMPacketSync();
    }

    /**
     * @protected
     * @param {WorkerRequestSvcCreatedEntities} request
     * @returns {WorkerResponseSvcCreatedEntities}
     */
    _handleSvcCreatedEntities(request) {
        const length = request.payload.length;

        for (let i = 0; i < length; i += 3) {
            const index = request.payload[i];
            const serial = request.payload[i + 1];
            const clazzId = request.payload[i + 2];

            const clazz = this._demo.getClassById(clazzId);

            if (clazz === null) {
                throw new Error(`Couldn't find class [ ${clazzId} ]`);
            }

            this._demo.registerEntity(new Entity(index, serial, clazz));
        }

        return new WorkerResponseSvcCreatedEntities();
    }

    /**
     * @protected
     * @param {WorkerRequestSvcUpdatedEntities} request
     * @returns {WorkerResponseSvcUpdatedEntities}
     */
    _handleSvcUpdatedEntities(request) {
        const messagePacket = request.payload;

        let events;

        try {
            events = this._demoMessageHandler.handleSvcPacketEntitiesPartial(messagePacket);
        } catch {
            events = [ ];
        }

        return new WorkerResponseSvcUpdatedEntities(events);
    }

    /**
     * @protected
     * @param {WorkerRequestSvcUpdatedEntitiesBatch} request
     * @returns {WorkerResponseSvcUpdatedEntitiesBatch}
     */
    _handleSvcUpdatedEntitiesBatch(request) {
        const responses = request.payload.map(r => this._handleSvcUpdatedEntities(r));

        return new WorkerResponseSvcUpdatedEntitiesBatch(responses);
    }
}

export default Worker;
