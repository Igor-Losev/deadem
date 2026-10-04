import Assert from '../../core/Assert.js';

const registries = new WeakMap();

class MessagePacketType {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     * @param {string|null} [protoName=null]
     */
    constructor(code, id, protoName = null) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(protoName === null || (typeof protoName === 'string' && protoName.length > 0));

        /** @private */
        this._code = code;
        /** @private */
        this._id = id;
        /** @private */
        this._protoName = protoName;

        const owner = new.target;

        let registry = registries.get(owner) || null;

        if (registry === null) {
            registry = new Map();

            registries.set(owner, registry);
        }

        registry.set(id, this);
    }

    /**
     * @public
     * @returns {string}
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

    /**
     * @public
     * @returns {string|null}
     */
    get protoName() {
        return this._protoName;
    }

    /**
     * @public
     * @static
     * @returns {Array<MessagePacketType>}
     */
    static getAll() {
        const members = new Map();

        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            for (const [ id, member ] of registry) {
                if (!members.has(id)) {
                    members.set(id, member);
                }
            }
        }

        return Array.from(members.values());
    }

    /**
     * @public
     * @static
     * @param {number} id
     * @returns {MessagePacketType|null}
     */
    static getById(id) {
        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            const member = registry.get(id) || null;

            if (member !== null) {
                return member;
            }
        }

        return null;
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

    static get USER_MESSAGE_SAY_TEXT_2() { return UMSayText2; }
    static get USER_MESSAGE_TEXT_MSG() { return UMTextMsg; }
    static get USER_MESSAGE_VOICE_MASK() { return UMVoiceMask; }
    static get USER_MESSAGE_SEND_AUDIO() { return UMSendAudio; }
    static get USER_MESSAGE_PARTICLE_MANAGER() { return UMParticleManager; }
    static get USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL() { return UMPlayResponseConditional; }

    static get GE_PLACE_DECAL_EVENT() { return GE_PlaceDecalEvent; }
    static get GE_SOURCE1_LEGACY_GAME_EVENT_LIST() { return GESource1LegacyGameEventList; }
    static get GE_SOURCE1_LEGACY_GAME_EVENT() { return GE_Source1LegacyGameEvent; }
    static get GE_SOS_START_SOUND_EVENT() { return GE_SosStartSoundEvent; }
    static get GE_SOS_STOP_SOUND_EVENT() { return GE_SosStopSoundEvent; }
    static get GE_SOS_SET_SOUND_EVENT_PARAMS() { return GE_SosSetSoundEventParams; }
    static get GE_SOS_STOP_SOUND_EVENT_HASH() { return GE_SosStopSoundEventHash; }

    static get TE_EFFECT_DISPATCH() { return TE_EffectDispatch; }
}

const netTick = new MessagePacketType('net_Tick', 4, 'CNETMsg_Tick');
const netSetConVar = new MessagePacketType('net_SetConVar', 6, 'CNETMsg_SetConVar');
const netSignonState = new MessagePacketType('net_SignonState', 7, 'CNETMsg_SignonState');
const netSpawnGroupLoad = new MessagePacketType('net_SpawnGroup_Load', 8, 'CNETMsg_SpawnGroup_Load');
const netSpawnGroupManifestUpdate = new MessagePacketType('net_SpawnGroup_ManifestUpdate', 9, 'CNETMsg_SpawnGroup_ManifestUpdate');
const netSpawnGroupSetCreationTick = new MessagePacketType('net_SpawnGroup_SetCreationTick', 11, 'CNETMsg_SpawnGroup_SetCreationTick');

const svcServerInfo = new MessagePacketType('svc_ServerInfo', 40, 'CSVCMsg_ServerInfo');
const svcClassInfo = new MessagePacketType('svc_ClassInfo', 42, 'CSVCMsg_ClassInfo');
const svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', 44, 'CSVCMsg_CreateStringTable');
const svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', 45, 'CSVCMsg_UpdateStringTable');
const svcVoiceInit = new MessagePacketType('svc_VoiceInit', 46, 'CSVCMsg_VoiceInit');
const svcVoiceData = new MessagePacketType('svc_VoiceData', 47, 'CSVCMsg_VoiceData');
const svcClearAllStringTables = new MessagePacketType('svc_ClearAllStringTables', 51, 'CSVCMsg_ClearAllStringTables');
const svcPacketEntities = new MessagePacketType('svc_PacketEntities', 55, 'CSVCMsg_PacketEntities');
const svcHltvStatus = new MessagePacketType('svc_HLTVStatus', 62, 'CSVCMsg_HLTVStatus');
const svcUserCommands = new MessagePacketType('svc_UserCmds', 76, 'CSVCMsg_UserCommands');

const UMSayText2 = new MessagePacketType('UM_SayText2', 118, 'CUserMessageSayText2');
const UMTextMsg = new MessagePacketType('UM_TextMsg', 124, 'CUserMessageTextMsg');
const UMVoiceMask = new MessagePacketType('UM_VoiceMask', 128, 'CUserMessageVoiceMask');
const UMSendAudio = new MessagePacketType('UM_SendAudio', 130, 'CUserMessageSendAudio');
const UMParticleManager = new MessagePacketType('UM_ParticleManager', 145, 'CUserMsg_ParticleManager');
const UMPlayResponseConditional = new MessagePacketType('UM_PlayResponseConditional', 166, 'CUserMessage_PlayResponseConditional');

const GE_PlaceDecalEvent = new MessagePacketType('GE_PlaceDecalEvent', 201, 'CMsgPlaceDecalEvent');
const GESource1LegacyGameEventList = new MessagePacketType('GE_Source1LegacyGameEventList', 205, 'CMsgSource1LegacyGameEventList');
const GE_Source1LegacyGameEvent = new MessagePacketType('GE_Source1LegacyGameEvent', 207, 'CMsgSource1LegacyGameEvent');
const GE_SosStartSoundEvent = new MessagePacketType('GE_SosStartSoundEvent', 208, 'CMsgSosStartSoundEvent');
const GE_SosStopSoundEvent = new MessagePacketType('GE_SosStopSoundEvent', 209, 'CMsgSosStopSoundEvent');
const GE_SosSetSoundEventParams = new MessagePacketType('GE_SosSetSoundEventParams', 210, 'CMsgSosSetSoundEventParams');
const GE_SosStopSoundEventHash = new MessagePacketType('GE_SosStopSoundEventHash', 212, 'CMsgSosStopSoundEventHash');

const TE_EffectDispatch = new MessagePacketType('TE_EffectDispatch', 400, 'CMsgTEEffectDispatch');

export default MessagePacketType;
