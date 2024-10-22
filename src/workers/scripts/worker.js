'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const snappy = require('snappy');

const MessagePacketExtractor = require('./../../data/MessagePacketExtractor');

const WorkerTaskType = require('./../../data/enums/WorkerTaskType');

const WorkerTask = require('../WorkerTask');

const LoggerProvider = require('./../../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../../providers/ProtoProvider.instance');

const logger = LoggerProvider.getLogger('Worker');

const LOGGER_PREFIX = `Worker #${threadId}`;

const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');

(() => {
    logger.info(`${LOGGER_PREFIX}: Started Worker [ ${threadId} ]`);

    parentPort.on('message', (taskPlain) => {
        const task = WorkerTask.fromObject(taskPlain);

        let result;

        switch (task.type) {
            case WorkerTaskType.DEMO_PACKET_PARSE: {
                result = [ ];

                task.data.forEach(([ compressed, buffer ]) => {
                    const messages = [ ];

                    let decompressed;

                    if (compressed) {
                        decompressed = snappy.uncompressSync(buffer);
                    } else {
                        decompressed = buffer;
                    }

                    const decoded = CDemoPacket.decode(decompressed);

                    const extractor = new MessagePacketExtractor(decoded.data).retrieve();

                    for (const messagePacket of extractor) {
                        messages.push([ messagePacket.type, messagePacket.payload ]);
                    }

                    result.push(messages);
                });

                parentPort.postMessage(result);

                break;
            }
            default: {
                throw new Error(`Unhandled task [ ${task.type.code} ]`);
            }
        }
    });
})();
