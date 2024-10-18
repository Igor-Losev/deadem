const { parentPort, threadId, workerData } = require('node:worker_threads');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('Worker');

(() => {
    logger.info(`Worker #${threadId}: Started Worker [ ${threadId} ]`);

    parentPort.on('message', (buffer) => {
        const extractor = new MessagePacketExtractor(buffer).retrieve();

        const messages = [ ];

        for (const messagePacket of extractor) {
            const messagePacketParser = new MessagePacketParser(messagePacket);

            // const parsed = messagePacketParser.parse();

            messages.push(messagePacket);
        }

        parentPort.postMessage(messages);
    });
})();
