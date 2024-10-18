const { parentPort, threadId, workerData } = require('node:worker_threads');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('Worker');

(() => {
    logger.info(`Started Worker [ ${threadId} ]`);

    // process.exit(0);
})();
