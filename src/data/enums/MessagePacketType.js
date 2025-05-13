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
    static get NET_SET_CON_VAR() { return netSetConVar; }
    static get NET_SIGNON_STATE() { return netSignonState; }
    static get NET_SPAWN_GROUP_LOAD() { return netSpawnGroupLoad; }
    static get NET_SPAWN_GROUP_SET_CREATION_TICK() { return netSpawnGroupSetCreationTick; }

    static get SVC_SERVER_INFO() { return svcServerInfo; }
    static get SVC_CLASS_INFO() { return svcClassInfo; }
    static get SVC_CREATE_STRING_TABLE() { return svcCreateStringTable; }
    static get SVC_UPDATE_STRING_TABLE() { return svcUpdateStringTable; }
    static get SVC_VOICE_INIT() { return svcVoiceInit; }
    static get SVC_CLEAR_ALL_STRING_TABLES() { return svcClearAllStringTables; }
    static get SVC_PACKET_ENTITIES() { return svcPacketEntities; }
    static get SVC_HLTV_STATUS() { return svcHltvStatus; }
    static get SVC_USER_COMMANDS() { return svcUserCommands; }

    static get USER_MESSAGE_PARTICLE_MANAGER() { return UMParticleManager; }
    static get USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL() { return UMPlayResponseConditional; }

    static get GE_SOURCE1_LEGACY_GAME_EVENT_LIST() { return GESource1LegacyGameEventList; }
    static get GE_SOURCE1_LEGACY_GAME_EVENT() { return GE_Source1LegacyGameEvent; }
    static get GE_SOS_START_SOUND_EVENT() { return GE_SosStartSoundEvent; }
    static get GE_SOS_STOP_SOUND_EVENT() { return GE_SosStopSoundEvent; }
    static get GE_SOS_SET_SOUND_EVENT_PARAMS() { return GE_SosSetSoundEventParams; }

    static get CITADEL_USER_MESSAGE_DAMAGE() { return citadelUserMessageDamage; }
}

// Enums
const ECitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds'),
    EGameEvents = ProtoProvider.GAME_EVENTS.getEnum('EBaseGameEvents'),
    ENET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages'),
    ESVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages'),
    EUserMessages = ProtoProvider.USER_MESSAGES.getEnum('EBaseUserMessages');

// Network Base Types
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick'),
    CNETMsg_SetConVar = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SetConVar'),
    CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState'),
    CNETMsg_SpawnGroupLoad = ProtoProvider.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_Load'),
    CNETMsg_SpawnGroupSetCreationTick = ProtoProvider.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_SetCreationTick');

// Citadel User Messages
const CCitadelUserMessage_Damage = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage');

// Game Events
const CMsgSource1LegacyGameEventList = ProtoProvider.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEventList'),
    CMsgSource1LegacyGameEvent = ProtoProvider.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEvent'),
    CMsgSosStartSoundEvent = ProtoProvider.GAME_EVENTS.lookupType('CMsgSosStartSoundEvent'),
    CMsgSosStopSoundEvent = ProtoProvider.GAME_EVENTS.lookupType('CMsgSosStopSoundEvent'),
    CMsgSosSetSoundEventParams = ProtoProvider.GAME_EVENTS.lookupType('CMsgSosSetSoundEventParams'),
    CMsgSosStopSoundEventHash = ProtoProvider.GAME_EVENTS.lookupType('CMsgSosStopSoundEventHash');

// User Messages
const CUserMsg_ParticleManager = ProtoProvider.USER_MESSAGES.lookupType('CUserMsg_ParticleManager'),
    CUserMsg_PlayResponseConditional = ProtoProvider.USER_MESSAGES.lookupType('CUserMessage_PlayResponseConditional');

// Net Messages
const CSVCMsg_ServerInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo'),
    CSVCMsg_ClassInfo = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo'),
    CSVCMsg_CreateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable'),
    CSVCMsg_UpdateStringTable = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable'),
    CSVCMsg_VoiceInit = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_VoiceInit'),
    CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables'),
    CSVCMsg_PacketEntities = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities'),
    CSVCMsg_HltvStatus = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_HLTVStatus'),
    CSVCMsg_UserCommands = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UserCommands');

const netTick = new MessagePacketType('net_Tick', ENET_Messages.net_Tick, CNETMsg_Tick), // 4
    netSetConVar = new MessagePacketType('net_SetConVar', ENET_Messages.net_SetConVar, CNETMsg_SetConVar), // 6
    netSignonState = new MessagePacketType('net_SignonState', ENET_Messages.net_SignonState, CNETMsg_SignonState), // 7
    netSpawnGroupLoad = new MessagePacketType('net_SpawnGroup_Load', ENET_Messages.net_SpawnGroup_Load, CNETMsg_SpawnGroupLoad), // 8
    netSpawnGroupSetCreationTick = new MessagePacketType('net_SpawnGroup_SetCreationTick', ENET_Messages.net_SpawnGroup_SetCreationTick, CNETMsg_SpawnGroupSetCreationTick) // 11

const svcServerInfo = new MessagePacketType('svc_ServerInfo', ESVC_Messages.svc_ServerInfo, CSVCMsg_ServerInfo), // 40
    svcClassInfo = new MessagePacketType('svc_ClassInfo', ESVC_Messages.svc_ClassInfo, CSVCMsg_ClassInfo), // 42
    svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', ESVC_Messages.svc_CreateStringTable, CSVCMsg_CreateStringTable), // 44
    svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', ESVC_Messages.svc_UpdateStringTable, CSVCMsg_UpdateStringTable), // 45
    svcVoiceInit = new MessagePacketType('svc_VoiceInit', ESVC_Messages.svc_VoiceInit, CSVCMsg_VoiceInit), // 46
    svcClearAllStringTables = new MessagePacketType('svc_ClearAllStringTables', ESVC_Messages.svc_ClearAllStringTables, CSVCMsg_ClearAllStringTables), // 51
    svcPacketEntities = new MessagePacketType('svc_PacketEntities', ESVC_Messages.svc_PacketEntities, CSVCMsg_PacketEntities), // 55
    svcHltvStatus = new MessagePacketType('svc_HLTVStatus', ESVC_Messages.svc_HLTVStatus, CSVCMsg_HltvStatus), // 62
    svcUserCommands = new MessagePacketType('svc_UserCmds', ESVC_Messages.svc_UserCmds, CSVCMsg_UserCommands); // 76

const UMParticleManager = new MessagePacketType('UM_ParticleManager', EUserMessages.UM_ParticleManager, CUserMsg_ParticleManager), // 145
    UMPlayResponseConditional = new MessagePacketType('UM_PlayResponseConditional', EUserMessages.UM_PlayResponseConditional, CUserMsg_PlayResponseConditional); // 166

const GESource1LegacyGameEventList = new MessagePacketType('GE_Source1LegacyGameEventList', EGameEvents.GE_Source1LegacyGameEventList, CMsgSource1LegacyGameEventList), // 205
    GE_Source1LegacyGameEvent = new MessagePacketType('GE_Source1LegacyGameEvent', EGameEvents.GE_Source1LegacyGameEvent, CMsgSource1LegacyGameEvent), // 207
    GE_SosStartSoundEvent = new MessagePacketType('GE_SosStartSoundEvent', EGameEvents.GE_SosStartSoundEvent, CMsgSosStartSoundEvent), // 208
    GE_SosStopSoundEvent = new MessagePacketType('GE_SosStopSoundEvent', EGameEvents.GE_SosStopSoundEvent, CMsgSosStopSoundEvent), // 209
    GE_SosSetSoundEventParams = new MessagePacketType('GE_SosSetSoundEventParams', EGameEvents.GE_SosSetSoundEventParams, CMsgSosSetSoundEventParams), // 210
    GE_SosStopSoundEventHash = new MessagePacketType('GE_SosStopSoundEventHash', EGameEvents.GE_SosStopSoundEventHash, CMsgSosStopSoundEventHash); // 212

const citadelUserMessageDamage = new MessagePacketType('k_EUserMsg_Damage', ECitadelUserMessageIds.k_EUserMsg_Damage, CCitadelUserMessage_Damage); // 300

module.exports = MessagePacketType;
