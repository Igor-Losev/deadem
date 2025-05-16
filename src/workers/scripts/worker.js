'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const SnappyDecompressor = require('./../../decompressors/SnappyDecompressor.instance');

const MessagePacketRawExtractor = require('./../../extractors/MessagePacketRawExtractor');

const WorkerMessageType = require('./../../data/enums/WorkerMessageType');

const LoggerProvider = require('./../../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../../providers/ProtoProvider.instance');

const WorkerRequestSerializer = require('./../serializers/WorkerRequestSerializer.instance'),
    WorkerResponseSerializer = require('./../serializers/WorkerResponseSerializer.instance');

const WorkerResponseDHPParse = require('./../responses/WorkerResponseDHPParse');

const logger = LoggerProvider.getLogger('Worker');

const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');

const LOGGER_PREFIX = `Worker #${threadId}`;

(() => {
    logger.info(`${LOGGER_PREFIX}: Started Worker [ ${threadId} ]`);

    parentPort.on('message', (requestRaw) => {
        const request = WorkerRequestSerializer.deserialize(requestRaw);

        switch (request.type) {
            case WorkerMessageType.DEMO_HEAVY_PACKET_PARSE:
                handleHeavyPacketParse(request);

                break;
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }
    });
})();

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

        const decoded = CDemoPacket.decode(decompressed);

        const extractor = new MessagePacketRawExtractor(decoded.data).retrieve();

        for (const messagePacketRaw of extractor) {
            batch.push(messagePacketRaw);
        }

        batches.push(batch);
    });

    const response = new WorkerResponseDHPParse(batches);

    parentPort.postMessage(WorkerResponseSerializer.serialize(response));
}
