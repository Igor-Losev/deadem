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

        switch (request.type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                this._handleHeavyPacketParse(request);

                break;
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                const demoPacket = request.payload;

                switch (demoPacket.type) {
                    case DemoPacketType.DEM_CLASS_INFO:
                        this._handleClassInfo(request);

                        break;
                    case DemoPacketType.DEM_SEND_TABLES:
                        this._handleSendTables(request);

                        break;
                    case DemoPacketType.DEM_STRING_TABLES:
                        this._handleStringTables(request);

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
                        this._handleSvcClearAllStringTables(request);

                        break;
                    case MessagePacketType.SVC_CREATE_STRING_TABLE:
                        this._handleSvcCreateStringTable(request);

                        break;
                    case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                        this._handleSvcUpdateStringTable(request);

                        break;
                    case MessagePacketType.SVC_SERVER_INFO:
                        this._handleSvcServerInfo(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.MESSAGE_PACKET_SYNC.code} ] [ ${messagePacket.type.code} ]`);
                }

                break;
            }
            case WorkerMessageType.SVC_CREATED_ENTITIES: {
                this._handleSvcCreatedEntities(request);

                break;
            }
            case WorkerMessageType.SVC_UPDATED_ENTITIES: {
                this._handleSvcUpdatedEntities(request);

                break;
            }
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }
    }

    /**
     * @protected
     * @param {WorkerRequestDHPParse} request
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

        const response = new WorkerResponseDHPParse(batches);

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleClassInfo(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemClassInfo(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleSendTables(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemSendTables(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleStringTables(request) {
        const demoPacket = request.payload;

        this._demoPacketHandler.handleDemStringTables(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcClearAllStringTables(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcCreateStringTable(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcUpdateStringTable(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcServerInfo(request) {
        const messagePacket = request.payload;

        this._demoMessageHandler.handleSvcServerInfo(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
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

        const response = new WorkerResponseSvcCreatedEntities();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcUpdatedEntities(request) {
        const messagePacket = request.payload;

        let events;

        try {
            events = this._demoMessageHandler.handleSvcPacketEntitiesPartial(messagePacket);
        } catch {
            events = [ ];
        }

        const response = new WorkerResponseSvcUpdatedEntities(events);

        this._respond(response);
    }
}

export default Worker;
