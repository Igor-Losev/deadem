'use strict';

const assert = require('node:assert/strict');

const ProtoProvider = require('./../../providers/ProtoProvider.instance');

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class MessagePacketType {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {Number} id
     * @param {*} proto
     */
    constructor(code, id, proto) {
        assert(typeof code === 'string' && code.length > 0);
        assert(Number.isInteger(id));

        this._code = code;
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

    get code() {
        return this._code;
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
    static get SVC_USER_COMMANDS() { return svcUserCommands; }
    static get CITADEL_USER_MESSAGE_DAMAGE() { return citadelUserMessageDamage; }
}

// Enums
const ECitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds'),
    ENET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages'),
    ESVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');

// Citadel User Messages
const CCitadelUserMessage_Damage = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage');

// Net Messages
const CSVCMsg_ClassInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo'),
    CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables'),
    CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable'),
    CSVCMsg_PacketEntities = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities'),
    CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo'),
    CSVCMsg_UpdateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable'),
    CSVCMsg_UserCommands = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UserCommands');

// Network Base Types
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick'),
    CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState'),
    CSVCMsgList_GameEvents = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CSVCMsgList_GameEvents');

const netTick = new MessagePacketType('net_Tick', ENET_Messages.net_Tick, CNETMsg_Tick); // 4

const svcServerInfo = new MessagePacketType('svc_ServerInfo', ESVC_Messages.svc_ServerInfo, CSVCMsg_ServerInfo), // 40
    svcClassInfo = new MessagePacketType('svc_ClassInfo', ESVC_Messages.svc_ClassInfo, CSVCMsg_ClassInfo), // 42
    svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', ESVC_Messages.svc_CreateStringTable, CSVCMsg_CreateStringTable), // 44
    svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', ESVC_Messages.svc_UpdateStringTable, CSVCMsg_UpdateStringTable), // 45
    svcClearAllStringTables = new MessagePacketType('svc_ClearAllStringTables', ESVC_Messages.svc_ClearAllStringTables, CSVCMsg_ClearAllStringTables), // 51
    svcPacketEntities = new MessagePacketType('svc_PacketEntities', ESVC_Messages.svc_PacketEntities, CSVCMsg_PacketEntities), // 55
    svcUserCommands = new MessagePacketType('svc_UserCmds', ESVC_Messages.svc_UserCmds, CSVCMsg_UserCommands); // 76

const citadelUserMessageDamage = new MessagePacketType('k_EUserMsg_Damage', ECitadelUserMessageIds.k_EUserMsg_Damage, CCitadelUserMessage_Damage); // 300

module.exports = MessagePacketType;
