import Logger from '#core/Logger.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import Demo from '#data/Demo.js';
import Entity from '#data/entity/Entity.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import DemoSource from '#data/enums/DemoSource.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';
import StringTableHandler from '#handlers/StringTableHandler.js';

import SchemaRegistry from '#src/SchemaRegistry.js';

import WorkerResponseBootstrap from '#workers/responses/WorkerResponseBootstrap.js';
import WorkerResponseDemoClear from '#workers/responses/WorkerResponseDemoClear.js';
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

        this._registry = null;

        this._handlers = {
            demoPacket: null,
            demoMessage: null,
            stringTable: null
        };
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
        const request = workerRequestClass.deserialize(requestRaw.payload, this._registry);

        switch (request.type) {
            case WorkerMessageType.BOOTSTRAP: {
                this._handleBootstrap(request);

                break;
            }
            case WorkerMessageType.DEMO_CLEAR: {
                this._handleDemoClear(request);

                break;
            }
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                this._handleHeavyPacketParse(request);

                break;
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                const demoPacket = request.payload;

                switch (demoPacket.type.id) {
                    case DemoPacketType.DEM_CLASS_INFO.id:
                        this._handleClassInfo(request);

                        break;
                    case DemoPacketType.DEM_SEND_TABLES.id:
                        this._handleSendTables(request);

                        break;
                    case DemoPacketType.DEM_STRING_TABLES.id:
                        this._handleStringTables(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.DEMO_PACKET_SYNC.code} ] [ ${demoPacket.type.code} ]`);
                }

                break;
            }
            case WorkerMessageType.MESSAGE_PACKET_SYNC: {
                const messagePacket = request.payload;

                switch (messagePacket.type.id) {
                    case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES.id:
                        this._handleSvcClearAllStringTables(request);

                        break;
                    case MessagePacketType.SVC_CREATE_STRING_TABLE.id:
                        this._handleSvcCreateStringTable(request);

                        break;
                    case MessagePacketType.SVC_UPDATE_STRING_TABLE.id:
                        this._handleSvcUpdateStringTable(request);

                        break;
                    case MessagePacketType.SVC_SERVER_INFO.id:
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
     * @param {WorkerRequestBootstrap} request
     */
    _handleBootstrap(request) {
        const snapshot = request.payload.registrySnapshot;

        const registry = SchemaRegistry.reconstruct(snapshot);

        this._registry = registry;

        this._handlers.stringTable = new StringTableHandler(registry, this._demo.stringTableContainer, Logger.NOOP);
        this._handlers.demoPacket = new DemoPacketHandler(registry, this._demo, this._handlers.stringTable);
        this._handlers.demoMessage = new DemoMessageHandler(registry, this._demo, this._handlers.stringTable);

        const response = new WorkerResponseBootstrap();
        
        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDHPParse} request
     */
    _handleHeavyPacketParse(request) {
        const batches = [];
        const stringTables = [];

        request.payload.forEach((data) => {
            const [ typeId, sourceId, compressed, buffer ] = data;
            const demoPacketType = this._registry.resolveDemoType(typeId);
            const demoSource = DemoSource.parseById(sourceId);

            if (demoPacketType === null) {
                return;
            }

            let decompressed;

            if (compressed) {
                decompressed = SnappyDecompressor.decompress(buffer);
            } else {
                decompressed = buffer;
            }

            let decoded;

            if (demoSource === DemoSource.HTTP_BROADCAST) {
                decoded = { data: decompressed };
            } else {
                const proto = this._registry.getDemoProto(demoPacketType);

                if (proto === null) {
                    return;
                }

                decoded = proto.decode(decompressed);
            }

            let extractor;

            if (demoPacketType.id === DemoPacketType.DEM_FULL_PACKET.id) {
                extractor = new MessagePacketRawExtractor(decoded.packet.data);

                stringTables.push(decoded.stringTable);
            } else {
                extractor = new MessagePacketRawExtractor(decoded.data);

                stringTables.push(null);
            }

            const packed = extractor.allPacked();

            batches.push(packed);
        });

        const response = new WorkerResponseDHPParse(batches, stringTables);

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDemoClear} _
     */
    _handleDemoClear(_) {
        this._demo.reset();

        const response = new WorkerResponseDemoClear();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleClassInfo(request) {
        const demoPacket = request.payload;

        this._handlers.demoPacket.handleDemClassInfo(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleSendTables(request) {
        const demoPacket = request.payload;

        this._handlers.demoPacket.handleDemSendTables(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketSync} request
     */
    _handleStringTables(request) {
        const demoPacket = request.payload;

        this._handlers.demoPacket.handleDemStringTables(demoPacket);

        const response = new WorkerResponseDPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcClearAllStringTables(request) {
        const messagePacket = request.payload;

        this._handlers.demoMessage.handleSvcClearAllStringTables(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcCreateStringTable(request) {
        const messagePacket = request.payload;

        this._handlers.demoMessage.handleSvcCreateStringTable(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcUpdateStringTable(request) {
        const messagePacket = request.payload;

        this._handlers.demoMessage.handleSvcUpdateStringTable(messagePacket);

        const response = new WorkerResponseMPacketSync();

        this._respond(response);
    }

    /**
     * @protected
     * @param {WorkerRequestMPacketSync} request
     */
    _handleSvcServerInfo(request) {
        const messagePacket = request.payload;

        this._handlers.demoMessage.handleSvcServerInfo(messagePacket);

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
            events = this._handlers.demoMessage.handleSvcPacketEntitiesPartial(messagePacket);
        } catch {
            events = [];
        }

        const response = new WorkerResponseSvcUpdatedEntities(events);

        this._respond(response);
    }
}

export default Worker;
