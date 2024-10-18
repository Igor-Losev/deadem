const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const logger = LoggerProvider.getLogger('MessagePacketParser');

const SVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');
const CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables');
const CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable');
const CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo');

const NET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages');
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick');
const CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState');
const CSVCMsgList_GameEvents = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CSVCMsgList_GameEvents');

class MessagePacketParser {
    /**
     * @public
     * @constructor
     * @param {MessagePacket} packet
     */
    constructor(packet) {
        this._packet = packet;
    }

    parse() {
        let data = null;

        switch (this._packet.type) {
            case NET_Messages.net_Tick: { // 4
                data = CNETMsg_Tick.decode(this._packet.payload);

                // console.log(data);

                break;
            }
            case SVC_Messages.svc_ServerInfo: { // 40
                data = CSVCMsg_ServerInfo.decode(this._packet.payload);

                // console.log(data);

                break;
            }
            case SVC_Messages.svc_CreateStringTable: { // 44
                data = CSVCMsg_CreateStringTable.decode(this._packet.payload);

                // console.log(data);

                break;
            }
            case SVC_Messages.svc_ClearAllStringTables: { // 51
                data = CSVCMsg_ClearAllStringTables.decode(this._packet.payload);

                // console.log(data);

                break;
            }
            default: {
                // logger.error(`Unhandled MessagePacket type [ ${this._packet.type} ]`);

                // throw new Error(`Unhandled MessagePacket type [ ${this._packet.type} ]`);
            }
        }

        return data;
    }
}

module.exports = MessagePacketParser;
