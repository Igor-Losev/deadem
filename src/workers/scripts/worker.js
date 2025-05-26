import { parentPort } from 'node:worker_threads';

import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import Demo from './../../data/Demo.js';

import DemoPacketType from '../../data/enums/DemoPacketType.js';
import MessagePacketType from './../../data/enums/MessagePacketType.js';
import WorkerMessageType from './../../data/enums/WorkerMessageType.js';

import DemoMessageHandler from './../../handlers/DemoMessageHandler.js';
import DemoPacketHandler from './../../handlers/DemoPacketHandler.js';

import WorkerRequestSerializer from './../serializers/WorkerRequestSerializer.instance.js';
import WorkerResponseSerializer from './../serializers/WorkerResponseSerializer.instance.js';

import WorkerResponseDHPParse from './../responses/WorkerResponseDHPParse.js';
import WorkerResponseDPacketSync from './../responses/WorkerResponseDPacketSync.js';
import WorkerResponseMPacketSync from './../responses/WorkerResponseMPacketSync.js';
import WorkerResponseSvcPacketEntities from './../responses/WorkerResponseSvcPacketEntities.js';

const state = getInitialState();

(() => {
    parentPort.on('message', (requestRaw) => {
        const request = WorkerRequestSerializer.deserialize(requestRaw);

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
            case WorkerMessageType.SVC_PACKET_ENTITIES: {
                handleSvcPacketEntities(request);

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

        const batch = extractor.all();

        batches.push(batch);
    });

    const response = new WorkerResponseDHPParse(batches);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleClassInfo(request) {
    const response = new WorkerResponseDPacketSync();

    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemClassInfo(demoPacket);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleSendTables(request) {
    const response = new WorkerResponseDPacketSync();

    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemSendTables(demoPacket);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestDPacketSync} request
 */
function handleStringTables(request) {
    const response = new WorkerResponseDPacketSync();

    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemStringTables(demoPacket);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcClearAllStringTables(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

    const response = new WorkerResponseMPacketSync();

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcCreateStringTable(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcCreateStringTable(messagePacket);

    const response = new WorkerResponseMPacketSync();

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcUpdateStringTable(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

    const response = new WorkerResponseMPacketSync();

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestSvcPacketEntities} request
 */
function handleSvcPacketEntities(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcPacketEntities(messagePacket);

    const response = new WorkerResponseSvcPacketEntities();

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerRequestMPacketSync} request
 */
function handleSvcServerInfo(request) {
    const messagePacket = request.payload;

    state.demoMessageHandler.handleSvcServerInfo(messagePacket);

    const response = new WorkerResponseMPacketSync();

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}
