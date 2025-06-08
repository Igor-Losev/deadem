import { parentPort } from 'node:worker_threads';

import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import Demo from '#data/Demo.js';
import Entity from '#data/entity/Entity.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

import WorkerResponseDHPParse from '#workers/responses/WorkerResponseDHPParse.js';
import WorkerResponseDPacketSync from '#workers/responses/WorkerResponseDPacketSync.js';
import WorkerResponseMPacketSync from '#workers/responses/WorkerResponseMPacketSync.js';
import WorkerResponseSvcCreatedEntities from '#workers/responses/WorkerResponseSvcCreatedEntities.js';
import WorkerResponseSvcUpdatedEntities from '#workers/responses/WorkerResponseSvcUpdatedEntities.js';

import WorkerMessageBridge from '#workers/WorkerMessageBridge.instance.js';

const state = getInitialState();

(() => {
    parentPort.on('message', (requestRaw) => {
        const workerRequestClass = WorkerMessageBridge.resolveRequestClass(requestRaw);

        const request = workerRequestClass.deserialize(requestRaw.payload);

        switch (request.type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE: {
                handleHeavyPacketParse(request);

                break;
            }
            case WorkerMessageType.DEMO_PACKET_SYNC: {
                const demoPacket = request.payload;

                switch (demoPacket.type) {
                    case DemoPacketType.DEM_CLASS_INFO:
                        handleClassInfo(request);

                        break;
                    case DemoPacketType.DEM_SEND_TABLES:
                        handleSendTables(request);

                        break;
                    case DemoPacketType.DEM_STRING_TABLES:
                        handleStringTables(request);

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
                        handleSvcClearAllStringTables(request);

                        break;
                    case MessagePacketType.SVC_CREATE_STRING_TABLE:
                        handleSvcCreateStringTable(request);

                        break;
                    case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                        handleSvcUpdateStringTable(request);

                        break;
                    case MessagePacketType.SVC_SERVER_INFO:
                        handleSvcServerInfo(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.MESSAGE_PACKET_SYNC.code} ] [ ${messagePacket.type.code} ]`);
                }

                break;
            }
            case WorkerMessageType.SVC_CREATED_ENTITIES: {
                handleSvcCreatedEntities(request);

                break;
            }
            case WorkerMessageType.SVC_UPDATED_ENTITIES: {
                handleSvcUpdatedEntities(request);

                break;
            }
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }
    });
})();

function getInitialState() {
    const demo = new Demo();

    const demoPacketHandler = new DemoPacketHandler(demo);
    const demoMessageHandler = new DemoMessageHandler(demo);

    return {
        demo,
        demoMessageHandler,
        demoPacketHandler
    };
}

/**
 * @param {WorkerRequestDHPParse} request
 */
function handleHeavyPacketParse(request) {
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

    respond(response);
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleClassInfo(request) {
    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemClassInfo(demoPacket);

    const response = new WorkerResponseDPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleSendTables(request) {
    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemSendTables(demoPacket);

    const response = new WorkerResponseDPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleStringTables(request) {
    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemStringTables(demoPacket);

    const response = new WorkerResponseDPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcClearAllStringTables(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

    const response = new WorkerResponseMPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcCreateStringTable(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcCreateStringTable(messagePacket);

    const response = new WorkerResponseMPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcUpdateStringTable(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

    const response = new WorkerResponseMPacketSync();

    respond(response);
}

/**
 * @param {WorkerRequestSvcCreatedEntities} request
 */
function handleSvcCreatedEntities(request) {
    const length = request.payload.length;

    for (let i = 0; i < length; i += 3) {
        const index = request.payload[i];
        const serial = request.payload[i + 1];
        const clazzId = request.payload[i + 2];

        const clazz = state.demo.getClassById(clazzId);

        if (clazz === null) {
            throw new Error(`Couldn't find class [ ${clazzId} ]`);
        }

        state.demo.registerEntity(new Entity(index, serial, clazz));
    }

    const response = new WorkerResponseSvcCreatedEntities();

    respond(response);
}

/**
 * @param {WorkerRequestSvcUpdatedEntities} request
 */
function handleSvcUpdatedEntities(request) {
    const messagePacket = request.payload;

    let events;

    try {
        events = state.demoMessageHandler.handleSvcPacketEntitiesPartial(messagePacket);
    } catch {
        events = [ ];
    }

    const response = new WorkerResponseSvcUpdatedEntities(events);

    respond(response);
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcServerInfo(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcServerInfo(messagePacket);

    const response = new WorkerResponseMPacketSync();

    respond(response);
}

/**
 * @param {WorkerResponse} response
 */
function respond(response) {
    parentPort.postMessage(response.serialize(), response.transfers);
}
