const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const MessagePacket = require('./MessagePacket');

const logger = LoggerProvider.getLogger('MessagePacketParser');

// citadel user messages
const CitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds');
const CCitadelUserMessage_Damage = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage');

// net messages
const SVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');
const CSVCMsg_ClassInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo');
const CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables');
const CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable');
const CSVCMsg_UpdateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable');
const CSVCMsg_PacketEntities = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities');
const CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo');

// network base types
const NET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages');
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick');
const CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState');
const CSVCMsgList_GameEvents = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CSVCMsgList_GameEvents');

const parsers = new Map();

/* 004 */ parsers.set(NET_Messages.net_Tick, p => CNETMsg_Tick.decode(p));

/* 040 */ parsers.set(SVC_Messages.svc_ServerInfo, p => CSVCMsg_ServerInfo.decode(p));
/* 042 */ parsers.set(SVC_Messages.svc_ClassInfo, p => CSVCMsg_ClassInfo.decode(p));
/* 044 */ parsers.set(SVC_Messages.svc_CreateStringTable, p => CSVCMsg_CreateStringTable.decode(p));
/* 045 */ parsers.set(SVC_Messages.svc_UpdateStringTable, p => CSVCMsg_UpdateStringTable.decode(p));
/* 051 */ parsers.set(SVC_Messages.svc_ClearAllStringTables, p => CSVCMsg_ClearAllStringTables.decode(p));
/* 055 */ parsers.set(SVC_Messages.svc_PacketEntities, p => CSVCMsg_PacketEntities.decode(p));

/* 300 */ parsers.set(CitadelUserMessageIds.k_EUserMsg_Damage, p => CCitadelUserMessage_Damage.decode(p));

class MessagePacketParser {
    /**
     * @public
     * @constructor
     */
    constructor() {

    }

    /**
     * @public
     * @param {number} type
     * @param {Buffer|Uint8Array} payload
     * @returns {MessagePacket|null}
     */
    parse(type, payload) {
        const parser = parsers.get(type) || null;

        if (parser === null) {
            return null;
        }

        const data = parser(payload);

        return new MessagePacket(type, data);
    }
}

module.exports = MessagePacketParser;
