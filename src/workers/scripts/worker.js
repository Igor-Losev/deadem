'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const MessagePacketExtractor = require('./../../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../../data/MessagePacketParser');

const WorkerTaskType = require('./../../data/enums/WorkerTaskType');

const WorkerTask = require('../WorkerTask');

const LoggerProvider = require('./../../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../../providers/ProtoProvider.instance');

const logger = LoggerProvider.getLogger('Worker');
const loggerPrefix = `Worker #${threadId}`;

/** demo.proto */
const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');
const EDemoCommands = ProtoProvider.DEMO.getEnum('EDemoCommands');

/** netmessages.proto */
const SVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');
const CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables');
const CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable');
const CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo');

/** networkbasetypes.proto */
const NET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages');
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick');
const CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState');
const CSVCMsgList_GameEvents = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CSVCMsgList_GameEvents');

(() => {
    logger.info(`${loggerPrefix}: Started Worker [ ${threadId} ]`);

    parentPort.on('message', (taskPlain) => {
        const task = WorkerTask.fromObject(taskPlain);

        let result;

        switch (task.type) {
            case WorkerTaskType.PACKET_PARSE: {
                result = [ ];

                const packets = task.data;

                packets.forEach((packet) => {
                    const buffer = packet._payload;

                    const messages = [ ];

                    const decoded = CDemoPacket.decode(buffer);

                    const extractor = new MessagePacketExtractor(decoded.data).retrieve();

                    for (const messagePacket of extractor) {
                        messages.push(messagePacket.payload);
                    }

                    result.push(messages);
                });

                parentPort.postMessage(result);
                // parentPort.postMessage([]);

                break;
            }
            default: {
                throw new Error(`Unhandled task [ ${task.type.code} ]`);
            }
        }
    });
})();
