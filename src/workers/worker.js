'use strict';

const { parentPort, threadId } = require('node:worker_threads');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

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

    parentPort.on('message', (task) => {
        const results = [ ];

        const packets = task._packets;

        packets.forEach((packet) => {
            const commandType = packet._command._value & ~64;

            const item = { command: commandType, packets: [ ] };

            results.push(item);

            switch (commandType) {
                case EDemoCommands.DEM_FileHeader: { // 1
                    break;
                }

                case EDemoCommands.DEM_Packet: // 7
                case EDemoCommands.DEM_SignonPacket: { // 8
                    const decoded = CDemoPacket.decode(packet._payload);

                    const extractor = new MessagePacketExtractor(decoded.data).retrieve();

                    for (const messagePacket of extractor) {
                        item.packets.push(messagePacket.type);
                        switch (messagePacket.type) {
                            case NET_Messages.net_Tick: { // 4
                                const data = CNETMsg_Tick.decode(messagePacket.payload);

                                break;
                            }
                            case SVC_Messages.svc_ServerInfo: { // 40
                                const data = CSVCMsg_ServerInfo.decode(messagePacket.payload);

                                break;
                            }
                            case SVC_Messages.svc_CreateStringTable: { // 44
                                const data = CSVCMsg_CreateStringTable.decode(messagePacket.payload);

                                break;
                            }
                            case SVC_Messages.svc_ClearAllStringTables: { // 51
                                const data = CSVCMsg_ClearAllStringTables.decode(messagePacket.payload);

                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                }
            }
        });

        parentPort.postMessage(results);
    });
})();
