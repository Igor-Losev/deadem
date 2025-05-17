'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const SnappyDecompressor = require('./../../decompressors/SnappyDecompressor.instance');

const MessagePacketRawExtractor = require('./../../extractors/MessagePacketRawExtractor');

const Demo = require('./../../data/Demo');

const DemoCommandType = require('./../../data/enums/DemoCommandType'),
    WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const DemoPacketHandler = require('./../../handlers/DemoPacketHandler');

const LoggerProvider = require('./../../providers/LoggerProvider.instance');

const WorkerRequestSerializer = require('./../serializers/WorkerRequestSerializer.instance'),
    WorkerResponseSerializer = require('./../serializers/WorkerResponseSerializer.instance');

const WorkerResponseDClassInfo = require('./../responses/WorkerResponseDClassInfo'),
    WorkerResponseDHPParse = require('./../responses/WorkerResponseDHPParse'),
    WorkerResponseDSendTables = require('./../responses/WorkerResponseDSendTables');

const logger = LoggerProvider.getLogger('Worker');

const LOGGER_PREFIX = `Worker #${threadId}`;

const state = getInitialState();

(() => {
    logger.info(`${LOGGER_PREFIX}: Started Worker [ ${threadId} ]`);

    parentPort.on('message', (requestRaw) => {
        const request = WorkerRequestSerializer.deserialize(requestRaw);

        switch (request.type) {
            case WorkerMessageType.DEMO_CLASS_INFO:
                handleClassInfo(request);

                break;
            case WorkerMessageType.DEMO_SEND_TABLES:
                handleSendTables(request);

                break;
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE:
                handleHeavyPacketParse(request);

                break;
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }
    });
})();

function getInitialState() {
    const demo = new Demo();

    const demoPacketHandler = new DemoPacketHandler(demo);

    return {
        demo,
        demoPacketHandler
    };
}

/**
 * @param {WorkerRequestDHPParse} request
 */
function handleHeavyPacketParse(request) {
    const batches = [ ];

    request.payload.forEach((buffer) => {
        const batch = [ ];

        let decompressed;

        try {
            decompressed = SnappyDecompressor.decompress(buffer);
        } catch (e) {
            decompressed = buffer;
        }

        const decoded = DemoCommandType.DEM_PACKET.proto.decode(decompressed);

        const extractor = new MessagePacketRawExtractor(decoded.data).retrieve();

        for (const messagePacketRaw of extractor) {
            batch.push(messagePacketRaw);
        }

        batches.push(batch);
    });

    const response = new WorkerResponseDHPParse(batches);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerResponseDClassInfo} request
 */
function handleClassInfo(request) {
    const response = new WorkerResponseDClassInfo();

    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemClassInfo(demoPacket);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}

/**
 * @param {WorkerResponseDSendTables} request
 */
function handleSendTables(request) {
    const response = new WorkerResponseDSendTables();

    const demoPacket = request.payload;

    state.demoPacketHandler.handleDemSendTables(demoPacket);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}
