'use strict';

const ProtoProvider = require('./../../providers/ProtoProvider.instance');

const Enum = require('./Enum');

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class MessagePacketType extends Enum {
    constructor(code, id, proto) {
        super(code, code);

        this._id = id;
        this._proto = proto;

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    /**
     * @public
     * @static
     * @param {String} code
     * @returns {MessagePacketType|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @param {Number} id
     * @returns {MessagePacketType|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    get id() {
        return this._id;
    }

    get proto() {
        return this._proto;
    }

    static get NET_TICK() { return netTick; }
    static get SVC_SERVER_INFO() { return svcServerInfo; }
    static get SVC_CLASS_INFO() { return svcClassInfo; }
    static get SVC_CREATE_STRING_TABLE() { return svcCreateStringTable; }
    static get SVC_UPDATE_STRING_TABLE() { return svcUpdateStringTable; }
    static get SVC_CLEAR_ALL_STRING_TABLES() { return svcClearAllStringTables; }
    static get SVC_PACKET_ENTITIES() { return svcPacketEntities; }
    static get CITADEL_USER_MESSAGE_DAMAGE() { return citadelUserMessageDamage; }
}

// Enums
const CitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds'),
    NET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages'),
    SVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');

// Citadel User Messages
const CCitadelUserMessage_Damage = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage');

// Net Messages
const CSVCMsg_ClassInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo'),
    CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables'),
    CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable'),
    CSVCMsg_UpdateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable'),
    CSVCMsg_PacketEntities = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities'),
    CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo');

// Network Base Types
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick'),
    CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState'),
    CSVCMsgList_GameEvents = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CSVCMsgList_GameEvents');

const netTick = new MessagePacketType('net_Tick', 4, CNETMsg_Tick),
    svcServerInfo = new MessagePacketType('svc_ServerInfo', 40, CSVCMsg_ServerInfo),
    svcClassInfo = new MessagePacketType('svc_ClassInfo', 42, CSVCMsg_ClassInfo),
    svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', 44, CSVCMsg_CreateStringTable),
    svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', 45, CSVCMsg_UpdateStringTable),
    svcClearAllStringTables = new MessagePacketType('svc_ClearAllStringTables', 51, CSVCMsg_ClearAllStringTables),
    svcPacketEntities = new MessagePacketType('svc_PacketEntities', 55, CSVCMsg_PacketEntities),
    citadelUserMessageDamage = new MessagePacketType('k_EUserMsg_Damage', 300, CCitadelUserMessage_Damage);

module.exports = MessagePacketType;
