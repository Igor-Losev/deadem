import Assert from '#core/Assert.js';

class MessagePacketType {
    /**
     * @constructor
     * @param {String} code
     * @param {number} id
     */
    constructor(code, id) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));

        this._code = code;
        this._id = id;
    }

    /**
     * @public
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    static get NET_TICK() { return netTick; }
    static get NET_SET_CON_VAR() { return netSetConVar; }
    static get NET_SIGNON_STATE() { return netSignonState; }
    static get NET_SPAWN_GROUP_LOAD() { return netSpawnGroupLoad; }
    static get NET_SPAWN_GROUP_MANIFEST_UPDATE() { return netSpawnGroupManifestUpdate; }
    static get NET_SPAWN_GROUP_SET_CREATION_TICK() { return netSpawnGroupSetCreationTick; }

    static get SVC_SERVER_INFO() { return svcServerInfo; }
    static get SVC_CLASS_INFO() { return svcClassInfo; }
    static get SVC_CREATE_STRING_TABLE() { return svcCreateStringTable; }
    static get SVC_UPDATE_STRING_TABLE() { return svcUpdateStringTable; }
    static get SVC_VOICE_INIT() { return svcVoiceInit; }
    static get SVC_VOICE_DATA() { return svcVoiceData; }
    static get SVC_CLEAR_ALL_STRING_TABLES() { return svcClearAllStringTables; }
    static get SVC_PACKET_ENTITIES() { return svcPacketEntities; }
    static get SVC_HLTV_STATUS() { return svcHltvStatus; }
    static get SVC_USER_COMMANDS() { return svcUserCommands; }

    static get USER_MESSAGE_VOICE_MASK() { return UMVoiceMask; }
    static get USER_MESSAGE_SEND_AUDIO() { return UMSendAudio; }
    static get USER_MESSAGE_PARTICLE_MANAGER() { return UMParticleManager; }
    static get USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL() { return UMPlayResponseConditional; }

    static get GE_SOURCE1_LEGACY_GAME_EVENT_LIST() { return GESource1LegacyGameEventList; }
    static get GE_SOURCE1_LEGACY_GAME_EVENT() { return GE_Source1LegacyGameEvent; }
    static get GE_SOS_START_SOUND_EVENT() { return GE_SosStartSoundEvent; }
    static get GE_SOS_STOP_SOUND_EVENT() { return GE_SosStopSoundEvent; }
    static get GE_SOS_SET_SOUND_EVENT_PARAMS() { return GE_SosSetSoundEventParams; }
    static get GE_SOS_STOP_SOUND_EVENT_HASH() { return GE_SosStopSoundEventHash; }

    static get TE_EFFECT_DISPATCH() { return TE_EffectDispatch; }
}

const netTick = new MessagePacketType('net_Tick', 4);
const netSetConVar = new MessagePacketType('net_SetConVar', 6);
const netSignonState = new MessagePacketType('net_SignonState', 7);
const netSpawnGroupLoad = new MessagePacketType('net_SpawnGroup_Load', 8);
const netSpawnGroupManifestUpdate = new MessagePacketType('net_SpawnGroup_ManifestUpdate', 9);
const netSpawnGroupSetCreationTick = new MessagePacketType('net_SpawnGroup_SetCreationTick', 11);

const svcServerInfo = new MessagePacketType('svc_ServerInfo', 40);
const svcClassInfo = new MessagePacketType('svc_ClassInfo', 42);
const svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', 44);
const svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', 45);
const svcVoiceInit = new MessagePacketType('svc_VoiceInit', 46);
const svcVoiceData = new MessagePacketType('svc_VoiceData', 47);
const svcClearAllStringTables = new MessagePacketType('svc_ClearAllStringTables', 51);
const svcPacketEntities = new MessagePacketType('svc_PacketEntities', 55);
const svcHltvStatus = new MessagePacketType('svc_HLTVStatus', 62);
const svcUserCommands = new MessagePacketType('svc_UserCmds', 76);

const UMVoiceMask = new MessagePacketType('UM_VoiceMask', 128);
const UMSendAudio = new MessagePacketType('UM_SendAudio', 130);
const UMParticleManager = new MessagePacketType('UM_ParticleManager', 145);
const UMPlayResponseConditional = new MessagePacketType('UM_PlayResponseConditional', 166);

const GESource1LegacyGameEventList = new MessagePacketType('GE_Source1LegacyGameEventList', 205);
const GE_Source1LegacyGameEvent = new MessagePacketType('GE_Source1LegacyGameEvent', 207);
const GE_SosStartSoundEvent = new MessagePacketType('GE_SosStartSoundEvent', 208);
const GE_SosStopSoundEvent = new MessagePacketType('GE_SosStopSoundEvent', 209);
const GE_SosSetSoundEventParams = new MessagePacketType('GE_SosSetSoundEventParams', 210);
const GE_SosStopSoundEventHash = new MessagePacketType('GE_SosStopSoundEventHash', 212);

const TE_EffectDispatch = new MessagePacketType('TE_EffectDispatch', 400);

export default MessagePacketType;
