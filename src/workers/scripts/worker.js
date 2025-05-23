'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const SnappyDecompressor = require('./../../decompressors/SnappyDecompressor.instance');

const MessagePacketRawExtractor = require('./../../extractors/MessagePacketRawExtractor');

const Demo = require('./../../data/Demo');

const DemoCommandType = require('./../../data/enums/DemoCommandType'),
    MessagePacketType = require('./../../data/enums/MessagePacketType'),
    WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const DemoMessageHandler = require('./../../handlers/DemoMessageHandler'),
    DemoPacketHandler = require('./../../handlers/DemoPacketHandler');

const WorkerRequestSerializer = require('./../serializers/WorkerRequestSerializer.instance'),
    WorkerResponseSerializer = require('./../serializers/WorkerResponseSerializer.instance');

const WorkerResponseDHPParse = require('./../responses/WorkerResponseDHPParse'),
    WorkerResponseDPacketSync = require('./../responses/WorkerResponseDPacketSync'),
    WorkerResponseMPacketSync = require('./../responses/WorkerResponseMPacketSync'),
    WorkerResponseSvcPacketEntities = require('./../responses/WorkerResponseSvcPacketEntities');

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

                switch (demoPacket.command) {
                    case DemoCommandType.DEM_CLASS_INFO:
                        handleClassInfo(request);

                        break;
                    case DemoCommandType.DEM_SEND_TABLES:
                        handleSendTables(request);

                        break;
                    case DemoCommandType.DEM_STRING_TABLES:
                        handleStringTables(request);

                        break;
                    default:
                        throw new Error(`Unhandled message [ ${WorkerMessageType.DEMO_PACKET_SYNC.code} ] [ ${demoPacket.command.code} ]`);
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
        } catch (e) {
            decompressed = buffer;
        }

        const decoded = DemoCommandType.DEM_PACKET.proto.decode(decompressed);

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
