import Assert from '#core/Assert.js';

import ProtoProvider from '#providers/ProtoProvider.instance.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class MessagePacketType {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {number} id
     * @param {*} proto
     */
    constructor(code, id, proto) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));

        this._code = code;
        this._id = id;
        this._proto = proto;

        if (registry.byCode.has(code)) {
            throw new Error(`MessagePacketType with code [ ${code} ] already exist`);
        }

        if (registry.byId.has(id)) {
            throw new Error(`MessagePacketType with id [ ${id} ] already exist`);
        }

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
     * @param {number} id
     * @returns {MessagePacketType|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
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

    /**
     * @public
     * @returns {protobuf.Root}
     */
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
    static get SVC_VOICE_DATA() { return svcVoiceData; }
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
    static get GE_SOS_STOP_SOUND_EVENT_HASH() { return GE_SosStopSoundEventHash; }

    static get CITADEL_USER_MESSAGE_DAMAGE() { return citadelUserMessageDamage; }
    static get CITADEL_USER_MESSAGE_MAP_PING() { return citadelUserMessageMapPing; }
    static get CITADEL_USER_MESSAGE_TEAM_REWARDS() { return citadelUserMessageTeamRewards; }
    static get CITADEL_USER_MESSAGE_TRIGGER_DAMAGE_FLASH() { return citadelUserMessageTriggerDamageFlash; }
    static get CITADEL_USER_MESSAGE_ABILITY_CHANGED() { return citadelUserMessageAbilitiesChanged; }
    static get CITADEL_USER_MESSAGE_RECENT_DAMAGE_SUMMARY() { return citadelUserMessageRecentDamageSummary; }
    static get CITADEL_USER_MESSAGE_SPECTATOR_TEAM_CHANGED() { return citadelUserMessageSpectatorTeamChanged; }
    static get CITADEL_USER_MESSAGE_CHAT_WHEEL() { return citadelUserMessageChatWheel; }
    static get CITADEL_USER_MESSAGE_GOLD_HISTORY() { return citadelUserMessageGoldHistory; }
    static get CITADEL_USER_MESSAGE_CHAT_MESSAGE() { return citadelUserMessageChatMessage; }
    static get CITADEL_USER_MESSAGE_QUICK_RESPONSE() { return citadelUserMessageQuickResponse; }
    static get CITADEL_USER_MESSAGE_POST_MATCH_DETAILS() { return citadelUserMessagePostMatchDetails; }
    static get CITADEL_USER_MESSAGE_CHAT_EVENT() { return citadelUserMessageChatEvent; }
    static get CITADEL_USER_MESSAGE_ABILITY_INTERRUPTED() { return citadelUserMessageAbilityInterrupted; }
    static get CITADEL_USER_MESSAGE_HERO_KILLED() { return citadelUserMessageHeroKilled; }
    static get CITADEL_USER_MESSAGE_RETURN_IDOL() { return citadelUserMessageReturnIdol; }
    static get CITADEL_USER_MESSAGE_SET_CLIENT_CAMERA_ANGLES() { return citadelUserMessageSetClientCameraAngles; }
    static get CITADEL_USER_MESSAGE_MAP_LINE() { return citadelUserMessageMapLine; }
    static get CITADEL_USER_MESSAGE_BULLET_HIT() { return citadelUserMessageBulletHit; }
    static get CITADEL_USER_MESSAGE_OBJECTIVE_MASK() { return citadelUserMessageObjectiveMask; }
    static get CITADEL_USER_MESSAGE_MODIFIER_APPLIED() { return citadelUserMessageModifierApplied; }
    static get CITADEL_USER_MESSAGE_CAMERA_CONTROLLER() { return citadelUserMessageCameraController; }
    static get CITADEL_USER_MESSAGE_AURA_MODIFIER_APPLIED() { return citadelUserMessageAuraModifierApplied; }
    static get CITADEL_USER_MESSAGE_OBSTRUCTED_SHOT_FIRED() { return citadelUserMessageObstructedShotFired; }
    static get CITADEL_USER_MESSAGE_ABILITY_LATE_FAILURE() { return citadelUserMessageAbilityLateFailure; }
    static get CITADEL_USER_MESSAGE_ABILITY_PING() { return citadelUserMessageAbilityPing; }
    static get CITADEL_USER_MESSAGE_POST_PROCESSING_ANIM() { return citadelUserMessagePostProcessingAnim; }
    static get CITADEL_USER_MESSAGE_DEATH_REPLAY_DATA() { return citadelUserMessageDeathReplayData; }
    static get CITADEL_USER_MESSAGE_PLAYER_LIFETIME_STAT_INFO() { return citadelUserMessagePlayerLifetimeStatInfo; }
    static get CITADEL_USER_MESSAGE_FORCE_SHOP_CLOSED() { return citadelUserMessageForceShopClosed; }
    static get CITADEL_USER_MESSAGE_STAMINA_CONSUMED() { return citadelUserMessageStaminaConsumed; }
    static get CITADEL_USER_MESSAGE_ABILITY_NOTIFY() { return citadelUserMessageAbilityNotify; }
    static get CITADEL_USER_MESSAGE_GET_DAMAGE_STATS_RESPONSE() { return citadelUserMessageGetDamageStatsResponse; }
    static get CITADEL_USER_MESSAGE_PARTICIPANT_START_SOUND_EVENT() { return citadelUserMessageParticipantStartSoundEvent; }
    static get CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT() { return citadelUserMessageParticipantStopSoundEvent; }
    static get CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT_HASH() { return citadelUserMessageParticipantStopSoundEventHash; }
    static get CITADEL_USER_MESSAGE_PARTICIPANT_SET_SOUND_EVENT_PARAMS() { return citadelUserMessageParticipantSetSoundEventParams; }
    static get CITADEL_USER_MESSAGE_PARTICIPANT_SET_LIBRARY_STACK_FIELDS() { return citadelUserMessageParticipantSetLibraryStackFields; }
    static get CITADEL_USER_MESSAGE_CURRENCY_CHANGED() { return citadelUserMessageCurrencyChanged; }
    static get CITADEL_USER_MESSAGE_GAME_OVER() { return citadelUserMessageGameOver; }
    static get CITADEL_USER_MESSAGE_BOSS_KILLED() { return citadelUserMessageBossKilled; }
    static get CITADEL_USER_MESSAGE_BOSS_DAMAGED() { return citadelUserMessageBossDamaged; }
    static get CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED() { return citadelUserMessageMidBossSpawned; }
    static get CITADEL_USER_MESSAGE_REJUV_STATUS() { return citadelUserMessageRejuvStatus; }
    static get CITADEL_USER_MESSAGE_KILL_STREAK() { return citadelUserMessageKillStreak; }
    static get CITADEL_USER_MESSAGE_TEAM_MSG() { return citadelUserMessageTeamMsg; }
    static get CITADEL_USER_MESSAGE_PLAYER_RESPAWNED() { return citadelUserMessagePlayerRespawned; }
    static get CITADEL_USER_MESSAGE_CALL_CHEATER_VOTE() { return citadelUserMessageCallCheaterVote; }
    static get CITADEL_USER_MESSAGE_MELEE_HIT() { return citadelUserMessageMeleeHit; }
    static get CITADEL_USER_MESSAGE_FLEX_SLOT_UNLOCKED() { return citadelUserMessageFlexSlotUnlocked; }
    static get CITADEL_USER_MESSAGE_SEASONAL_ACHIEVEMENT_UNLOCKED() { return citadelUserMessageSeasonalKill; }
    static get CITADEL_USER_MESSAGE_MUSIC_QUEUE() { return citadelUserMessageMusicQueue; }
    static get CITADEL_USER_MESSAGE_AG2_PARAM_TRIGGER() { return citadelUserMessageAG2ParamTrigger; }
    static get CITADEL_USER_MESSAGE_ITEM_PURCHASE_NOTIFICATION() { return citadelUserMessageItemPurchaseNotification; }
    static get CITADEL_USER_MESSAGE_ENTITY_PORTALLED() { return citadelUserMessageEntityPortalled; }
    static get CITADEL_USER_MESSAGE_STREET_BRAWL_SCORING() { return citadelUserMessageStreetBrawlScoring; }
    static get CITADEL_USER_MESSAGE_HUD_GAME_ANNOUNCEMENT() { return citadelUserMessageHudGameAnnouncement; }
    static get CITADEL_USER_MESSAGE_ITEM_DRAFT_REACTION() { return citadelUserMessageItemDraftReaction; }
    static get CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED() { return citadelUserMessageImportantAbilityUsed; }

    static get TE_EFFECT_DISPATCH() { return TE_EffectDispatch; }

    static get GE_FIRE_BULLETS() { return GE_FireBullets; }
    static get GE_PLAYER_ANIM_EVENT() { return GE_PlayerAnimEvent; }
    static get GE_PARTICLE_SYSTEM_MANAGER() { return GE_ParticleSystemManager; }
    static get GE_SCREEN_TEXT_PRETTY() { return GE_ScreenTextPretty; }
    // static get GE_SERVER_REQUESTED_TRACER() { return GE_ServerRequestedTracer; }
    static get GE_BULLET_IMPACT() { return GE_BulletImpact; }
    static get GE_ENABLE_SAT_VOLUMES_EVENT() { return GE_EnableSatVolumesEvent; }
    static get GE_PLACE_SAT_VOLUME_EVENT() { return GE_PlaceSatVolumeEvent; }
    static get GE_DISABLE_SAT_VOLUME_EVENT() { return GE_DisableSatVolumesEvent; }
    static get GE_REMOVE_SAT_VOLUME_EVENT() { return GE_RemoveSatVolumeEvent; }
    static get GE_REMOVE_BULLET() { return GE_RemoveBullet; }

    static get CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS() { return citadelEntityMessageBreakablePropSpawnDebris; }
}

// Enums
const ECitadelGameEvents = ProtoProvider.CITADEL_GAME_EVENTS.getEnum('ECitadelGameEvents'),
    ECitadelEntityMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelEntityMessageIds'),
    ECitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds'),
    EGameEvents = ProtoProvider.GAME_EVENTS.getEnum('EBaseGameEvents'),
    ENET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages'),
    ETemporaryEntityIds = ProtoProvider.TEMPORARY_ENTITIES.getEnum('ETEProtobufIds'),
    ESVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages'),
    EUserMessages = ProtoProvider.USER_MESSAGES.getEnum('EBaseUserMessages');

// Network Base Types
const CNETMsg_Tick = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick'),
    CNETMsg_SetConVar = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SetConVar'),
    CNETMsg_SignonState = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState'),
    CNETMsg_SpawnGroupLoad = ProtoProvider.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_Load'),
    CNETMsg_SpawnGroupSetCreationTick = ProtoProvider.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_SetCreationTick');

// Citadel Game Events
const CMsgFireBullets = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgFireBullets'),
    CMsgPlayerAnimEvent = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgPlayerAnimEvent'),
    CMsgParticleSystemManager = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgParticleSystemManager'),
    CMsgScreenTextPretty = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgScreenTextPretty'),
    // CMsgServerRequestedTracer = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgServerRequestedTracer'),
    CMsgBulletImpact = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgBulletImpact'),
    CMsgEnableSatVolumesEvent = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgEnableSatVolumesEvent'),
    CMsgPlaceSatVolumeEvent = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgPlaceSatVolumeEvent'),
    CMsgDisableSatVolumesEvent = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgDisableSatVolumesEvent'),
    CMsgRemoveSatVolumeEvent = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgRemoveSatVolumeEvent'),
    CMsgRemoveBullet = ProtoProvider.CITADEL_GAME_EVENTS.lookupType('CMsgRemoveBullet');

// Citadel User Messages
const CCitadelUserMessage_Damage = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage'),
    CCitadelUserMsg_MapPing = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MapPing'),
    CCitadelUserMsg_TeamRewards = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TeamRewards'),
    CCitadelUserMsg_TriggerDamageFlash = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TriggerDamageFlash'),
    CCitadelUserMsg_AbilitiesChanged = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilitiesChanged'),
    CCitadelUserMsg_RecentDamageSummary = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_RecentDamageSummary'),
    CCitadelUserMsg_SpectatorTeamChanged = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SpectatorTeamChanged'),
    CCitadelUserMsg_ChatWheel = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatWheel'),
    CCitadelUserMsg_GoldHistory = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_GoldHistory'),
    CCitadelUserMsg_ChatMsg = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatMsg'),
    CCitadelUserMsg_QuickResponse = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_QuickResponse'),
    CCitadelUserMsg_PostMatchDetails = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PostMatchDetails'),
    CCitadelUserMsg_ChatEvent = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatEvent'),
    CCitadelUserMsg_AbilityInterrupted = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityInterrupted'),
    CCitadelUserMsg_HeroKilled = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_HeroKilled'),
    CCitadelUserMsg_ReturnIdol = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ReturnIdol'),
    CCitadelUserMsg_SetClientCameraAngles = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SetClientCameraAngles'),
    CCitadelUserMsg_MapLine = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MapLine'),
    CCitadelUserMessage_BulletHit = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_BulletHit'),
    CCitadelUserMessage_ObjectiveMask = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ObjectiveMask'),
    CCitadelUserMessage_ModifierApplied = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ModifierApplied'),
    CCitadelUserMsg_CameraController = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_CameraController'),
    CCitadelUserMessage_AuraModifierApplied = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_AuraModifierApplied'),
    CCitadelUserMsg_ObstructedShotFired = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ObstructedShotFired'),
    CCitadelUserMsg_AbilityLateFailure = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityLateFailure'),
    CCitadelUserMsg_AbilityPing = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityPing'),
    CCitadelUserMsg_PostProcessingAnim = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PostProcessingAnim'),
    CCitadelUserMsg_DeathReplayData = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_DeathReplayData'),
    CCitadelUserMsg_PlayerLifetimeStatInfo = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PlayerLifetimeStatInfo'),
    CCitadelUserMsg_ForceShopClosed = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ForceShopClosed'),
    CCitadelUserMsg_StaminaConsumed = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_StaminaConsumed'),
    CCitadelUserMessage_AbilityNotify = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_AbilityNotify'),
    CCitadelUserMsg_GetDamageStatsResponse = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_GetDamageStatsResponse'),
    CCitadelUserMsg_ParticipantStartSoundEvent = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStartSoundEvent'),
    CCitadelUserMsg_ParticipantStopSoundEvent = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStopSoundEvent'),
    CCitadelUserMsg_ParticipantStopSoundEventHash = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStopSoundEventHash'),
    CCitadelUserMsg_ParticipantSetSoundEventParams = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantSetSoundEventParams'),
    CCitadelUserMsg_ParticipantSetLibraryStackFields = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantSetLibraryStackFields'),
    CCitadelUserMessage_CurrencyChanged = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_CurrencyChanged'),
    CCitadelUserMessage_GameOver = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_GameOver'),
    CCitadelUserMsg_BossKilled = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_BossKilled'),
    CCitadelUserMsg_BossDamaged = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_BossDamaged'),
    CCitadelUserMsg_MidBossSpawned = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MidBossSpawned'),
    CCitadelUserMsg_RejuvStatus = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_RejuvStatus'),
    CCitadelUserMsg_KillStreak = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_KillStreak'),
    CCitadelUserMsg_TeamMsg = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TeamMsg'),
    CCitadelUserMsg_PlayerRespawned = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PlayerRespawned'),
    CCitadelUserMsg_CallCheaterVote = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_CallCheaterVote'),
    CCitadelUserMessage_MeleeHit = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_MeleeHit'),
    CCitadelUserMsg_FlexSlotUnlocked = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_FlexSlotUnlocked'),
    CCitadelUserMsg_SeasonalKill = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SeasonalKill'),
    CCitadelUserMsg_MusicQueue = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MusicQueue'),
    CCitadelUserMsg_AG2ParamTrigger = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AG2ParamTrigger'),
    CCitadelUserMessage_ItemPurchaseNotification = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ItemPurchaseNotification'),
    CCitadelUserMsg_EntityPortalled = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_EntityPortalled'),
    CCitadelUserMsg_StreetBrawlScoring = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_StreetBrawlScoring'),
    CCitadelUserMsg_HudGameAnnouncement = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_HudGameAnnouncement'),
    CCitadelUserMsg_ItemDraftReaction = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ItemDraftReaction'),
    CCitadelUserMessage_ImportantAbilityUsed = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ImportantAbilityUsed');

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
    CSVCMsg_VoiceData = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_VoiceData'),
    CSVCMsg_ClearAllStringTables = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables'),
    CSVCMsg_PacketEntities = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities'),
    CSVCMsg_HltvStatus = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_HLTVStatus'),
    CSVCMsg_UserCommands = ProtoProvider.NET_MESSAGES.lookupType('CSVCMsg_UserCommands');

// Temporary Entities
const CMsgTEEffectDispatch = ProtoProvider.TEMPORARY_ENTITIES.lookupType('CMsgTEEffectDispatch');

const CCitadelEntityMsg_BreakablePropSpawnDebris = ProtoProvider.CITADEL_USER_MESSAGES.lookupType('CCitadelEntityMsg_BreakablePropSpawnDebris');

const netTick = new MessagePacketType('net_Tick', ENET_Messages.net_Tick, CNETMsg_Tick), // 4
    netSetConVar = new MessagePacketType('net_SetConVar', ENET_Messages.net_SetConVar, CNETMsg_SetConVar), // 6
    netSignonState = new MessagePacketType('net_SignonState', ENET_Messages.net_SignonState, CNETMsg_SignonState), // 7
    netSpawnGroupLoad = new MessagePacketType('net_SpawnGroup_Load', ENET_Messages.net_SpawnGroup_Load, CNETMsg_SpawnGroupLoad), // 8
    netSpawnGroupSetCreationTick = new MessagePacketType('net_SpawnGroup_SetCreationTick', ENET_Messages.net_SpawnGroup_SetCreationTick, CNETMsg_SpawnGroupSetCreationTick); // 11

const svcServerInfo = new MessagePacketType('svc_ServerInfo', ESVC_Messages.svc_ServerInfo, CSVCMsg_ServerInfo), // 40
    svcClassInfo = new MessagePacketType('svc_ClassInfo', ESVC_Messages.svc_ClassInfo, CSVCMsg_ClassInfo), // 42
    svcCreateStringTable = new MessagePacketType('svc_CreateStringTable', ESVC_Messages.svc_CreateStringTable, CSVCMsg_CreateStringTable), // 44
    svcUpdateStringTable = new MessagePacketType('svc_UpdateStringTable', ESVC_Messages.svc_UpdateStringTable, CSVCMsg_UpdateStringTable), // 45
    svcVoiceInit = new MessagePacketType('svc_VoiceInit', ESVC_Messages.svc_VoiceInit, CSVCMsg_VoiceInit), // 46
    svcVoiceData = new MessagePacketType('svc_VoiceData', ESVC_Messages.svc_VoiceData, CSVCMsg_VoiceData), // 47
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

const citadelUserMessageDamage = new MessagePacketType('k_EUserMsg_Damage', ECitadelUserMessageIds.k_EUserMsg_Damage, CCitadelUserMessage_Damage), // 300
    citadelUserMessageMapPing = new MessagePacketType('k_EUserMsg_MapPing', ECitadelUserMessageIds.k_EUserMsg_MapPing, CCitadelUserMsg_MapPing), // 303
    citadelUserMessageTeamRewards = new MessagePacketType('k_EUserMsg_TeamRewards', ECitadelUserMessageIds.k_EUserMsg_TeamRewards, CCitadelUserMsg_TeamRewards), // 304
    citadelUserMessageTriggerDamageFlash = new MessagePacketType('k_EUserMsg_TriggerDamageFlash', ECitadelUserMessageIds.k_EUserMsg_TriggerDamageFlash, CCitadelUserMsg_TriggerDamageFlash), // 308
    citadelUserMessageAbilitiesChanged = new MessagePacketType('k_EUserMsg_AbilitiesChanged', ECitadelUserMessageIds.k_EUserMsg_AbilitiesChanged, CCitadelUserMsg_AbilitiesChanged), // 309
    citadelUserMessageRecentDamageSummary = new MessagePacketType('k_EUserMsg_RecentDamageSummary', ECitadelUserMessageIds.k_EUserMsg_RecentDamageSummary, CCitadelUserMsg_RecentDamageSummary), // 310
    citadelUserMessageSpectatorTeamChanged = new MessagePacketType('k_EUserMsg_SpectatorTeamChanged', ECitadelUserMessageIds.k_EUserMsg_SpectatorTeamChanged, CCitadelUserMsg_SpectatorTeamChanged), // 311
    citadelUserMessageChatWheel = new MessagePacketType('k_EUserMsg_ChatWheel', ECitadelUserMessageIds.k_EUserMsg_ChatWheel, CCitadelUserMsg_ChatWheel), // 312
    citadelUserMessageGoldHistory = new MessagePacketType('k_EUserMsg_GoldHistory', ECitadelUserMessageIds.k_EUserMsg_GoldHistory, CCitadelUserMsg_GoldHistory), // 313
    citadelUserMessageChatMessage = new MessagePacketType('k_EUserMsg_ChatMsg', ECitadelUserMessageIds.k_EUserMsg_ChatMsg, CCitadelUserMsg_ChatMsg), // 314
    citadelUserMessageQuickResponse = new MessagePacketType('k_EUserMsg_QuickResponse', ECitadelUserMessageIds.k_EUserMsg_QuickResponse, CCitadelUserMsg_QuickResponse), // 315
    citadelUserMessagePostMatchDetails = new MessagePacketType('k_EUserMsg_PostMatchDetails', ECitadelUserMessageIds.k_EUserMsg_PostMatchDetails, CCitadelUserMsg_PostMatchDetails), // 316
    citadelUserMessageChatEvent = new MessagePacketType('k_EUserMsg_ChatEvent', ECitadelUserMessageIds.k_EUserMsg_ChatEvent, CCitadelUserMsg_ChatEvent), // 317
    citadelUserMessageAbilityInterrupted = new MessagePacketType('k_EUserMsg_AbilityInterrupted', ECitadelUserMessageIds.k_EUserMsg_AbilityInterrupted, CCitadelUserMsg_AbilityInterrupted), // 318
    citadelUserMessageHeroKilled = new MessagePacketType('k_EUserMsg_HeroKilled', ECitadelUserMessageIds.k_EUserMsg_HeroKilled, CCitadelUserMsg_HeroKilled), // 319
    citadelUserMessageReturnIdol = new MessagePacketType('k_EUserMsg_ReturnIdol', ECitadelUserMessageIds.k_EUserMsg_ReturnIdol, CCitadelUserMsg_ReturnIdol), // 320
    citadelUserMessageSetClientCameraAngles = new MessagePacketType('k_EUserMsg_SetClientCameraAngles', ECitadelUserMessageIds.k_EUserMsg_SetClientCameraAngles, CCitadelUserMsg_SetClientCameraAngles), // 321
    citadelUserMessageMapLine = new MessagePacketType('k_EUserMsg_MapLine', ECitadelUserMessageIds.k_EUserMsg_MapLine, CCitadelUserMsg_MapLine), // 322
    citadelUserMessageBulletHit = new MessagePacketType('k_EUserMsg_BulletHit', ECitadelUserMessageIds.k_EUserMsg_BulletHit, CCitadelUserMessage_BulletHit), // 323
    citadelUserMessageObjectiveMask = new MessagePacketType('k_EUserMsg_ObjectiveMask', ECitadelUserMessageIds.k_EUserMsg_ObjectiveMask, CCitadelUserMessage_ObjectiveMask), // 324
    citadelUserMessageModifierApplied = new MessagePacketType('k_EUserMsg_ModifierApplied', ECitadelUserMessageIds.k_EUserMsg_ModifierApplied, CCitadelUserMessage_ModifierApplied), // 325
    citadelUserMessageCameraController = new MessagePacketType('k_EUserMsg_CameraController', ECitadelUserMessageIds.k_EUserMsg_CameraController, CCitadelUserMsg_CameraController), // 326
    citadelUserMessageAuraModifierApplied = new MessagePacketType('k_EUserMsg_AuraModifierApplied', ECitadelUserMessageIds.k_EUserMsg_AuraModifierApplied, CCitadelUserMessage_AuraModifierApplied), // 327
    citadelUserMessageObstructedShotFired = new MessagePacketType('k_EUserMsg_ObstructedShotFired', ECitadelUserMessageIds.k_EUserMsg_ObstructedShotFired, CCitadelUserMsg_ObstructedShotFired), // 329
    citadelUserMessageAbilityLateFailure = new MessagePacketType('k_EUserMsg_AbilityLateFailure', ECitadelUserMessageIds.k_EUserMsg_AbilityLateFailure, CCitadelUserMsg_AbilityLateFailure), // 330
    citadelUserMessageAbilityPing = new MessagePacketType('k_EUserMsg_AbilityPing', ECitadelUserMessageIds.k_EUserMsg_AbilityPing, CCitadelUserMsg_AbilityPing), // 331
    citadelUserMessagePostProcessingAnim = new MessagePacketType('k_EUserMsg_PostProcessingAnim', ECitadelUserMessageIds.k_EUserMsg_PostProcessingAnim, CCitadelUserMsg_PostProcessingAnim), // 332
    citadelUserMessageDeathReplayData = new MessagePacketType('k_EUserMsg_DeathReplayData', ECitadelUserMessageIds.k_EUserMsg_DeathReplayData, CCitadelUserMsg_DeathReplayData), // 333
    citadelUserMessagePlayerLifetimeStatInfo = new MessagePacketType('k_EUserMsg_PlayerLifetimeStatInfo', ECitadelUserMessageIds.k_EUserMsg_PlayerLifetimeStatInfo, CCitadelUserMsg_PlayerLifetimeStatInfo), // 334
    citadelUserMessageForceShopClosed = new MessagePacketType('k_EUserMsg_ForceShopClosed', ECitadelUserMessageIds.k_EUserMsg_ForceShopClosed, CCitadelUserMsg_ForceShopClosed), // 336
    citadelUserMessageStaminaConsumed = new MessagePacketType('k_EUserMsg_StaminaConsumed', ECitadelUserMessageIds.k_EUserMsg_StaminaConsumed, CCitadelUserMsg_StaminaConsumed), // 337
    citadelUserMessageAbilityNotify = new MessagePacketType('k_EUserMsg_AbilityNotify', ECitadelUserMessageIds.k_EUserMsg_AbilityNotify, CCitadelUserMessage_AbilityNotify), // 338
    citadelUserMessageGetDamageStatsResponse = new MessagePacketType('k_EUserMsg_GetDamageStatsResponse', ECitadelUserMessageIds.k_EUserMsg_GetDamageStatsResponse, CCitadelUserMsg_GetDamageStatsResponse), // 339
    citadelUserMessageParticipantStartSoundEvent = new MessagePacketType('k_EUserMsg_ParticipantStartSoundEvent', ECitadelUserMessageIds.k_EUserMsg_ParticipantStartSoundEvent, CCitadelUserMsg_ParticipantStartSoundEvent), // 340
    citadelUserMessageParticipantStopSoundEvent = new MessagePacketType('k_EUserMsg_ParticipantStopSoundEvent', ECitadelUserMessageIds.k_EUserMsg_ParticipantStopSoundEvent, CCitadelUserMsg_ParticipantStopSoundEvent), // 341
    citadelUserMessageParticipantStopSoundEventHash = new MessagePacketType('k_EUserMsg_ParticipantStopSoundEventHash', ECitadelUserMessageIds.k_EUserMsg_ParticipantStopSoundEventHash, CCitadelUserMsg_ParticipantStopSoundEventHash), // 342
    citadelUserMessageParticipantSetSoundEventParams = new MessagePacketType('k_EUserMsg_ParticipantSetSoundEventParams', ECitadelUserMessageIds.k_EUserMsg_ParticipantSetSoundEventParams, CCitadelUserMsg_ParticipantSetSoundEventParams), // 343
    citadelUserMessageParticipantSetLibraryStackFields = new MessagePacketType('k_EUserMsg_ParticipantSetLibraryStackFields', ECitadelUserMessageIds.k_EUserMsg_ParticipantSetLibraryStackFields, CCitadelUserMsg_ParticipantSetLibraryStackFields), // 344
    citadelUserMessageCurrencyChanged = new MessagePacketType('k_EUserMsg_CurrencyChanged', ECitadelUserMessageIds.k_EUserMsg_CurrencyChanged, CCitadelUserMessage_CurrencyChanged), // 345
    citadelUserMessageGameOver = new MessagePacketType('k_EUserMsg_GameOver', ECitadelUserMessageIds.k_EUserMsg_GameOver, CCitadelUserMessage_GameOver), // 346
    citadelUserMessageBossKilled = new MessagePacketType('k_EUserMsg_BossKilled', ECitadelUserMessageIds.k_EUserMsg_BossKilled, CCitadelUserMsg_BossKilled), // 347
    citadelUserMessageBossDamaged = new MessagePacketType('k_EUserMsg_BossDamaged', ECitadelUserMessageIds.k_EUserMsg_BossDamaged, CCitadelUserMsg_BossDamaged), // 348
    citadelUserMessageMidBossSpawned = new MessagePacketType('k_EUserMsg_MidBossSpawned', ECitadelUserMessageIds.k_EUserMsg_MidBossSpawned, CCitadelUserMsg_MidBossSpawned), // 349
    citadelUserMessageRejuvStatus = new MessagePacketType('k_EUserMsg_RejuvStatus', ECitadelUserMessageIds.k_EUserMsg_RejuvStatus, CCitadelUserMsg_RejuvStatus), // 350
    citadelUserMessageKillStreak = new MessagePacketType('k_EUserMsg_KillStreak', ECitadelUserMessageIds.k_EUserMsg_KillStreak, CCitadelUserMsg_KillStreak), // 351
    citadelUserMessageTeamMsg = new MessagePacketType('k_EUserMsg_TeamMsg', ECitadelUserMessageIds.k_EUserMsg_TeamMsg, CCitadelUserMsg_TeamMsg), // 352
    citadelUserMessagePlayerRespawned = new MessagePacketType('k_EUserMsg_PlayerRespawned', ECitadelUserMessageIds.k_EUserMsg_PlayerRespawned, CCitadelUserMsg_PlayerRespawned), // 353
    citadelUserMessageCallCheaterVote = new MessagePacketType('k_EUserMsg_CallCheaterVote', ECitadelUserMessageIds.k_EUserMsg_CallCheaterVote, CCitadelUserMsg_CallCheaterVote), // 354
    citadelUserMessageMeleeHit = new MessagePacketType('k_EUserMsg_MeleeHit', ECitadelUserMessageIds.k_EUserMsg_MeleeHit, CCitadelUserMessage_MeleeHit), // 355
    citadelUserMessageFlexSlotUnlocked = new MessagePacketType('k_EUserMsg_FlexSlotUnlocked', ECitadelUserMessageIds.k_EUserMsg_FlexSlotUnlocked, CCitadelUserMsg_FlexSlotUnlocked), // 356
    citadelUserMessageSeasonalKill = new MessagePacketType('k_EUserMsg_SeasonalKill', ECitadelUserMessageIds.k_EUserMsg_SeasonalKill, CCitadelUserMsg_SeasonalKill), // 357
    citadelUserMessageMusicQueue = new MessagePacketType('k_EUserMsg_MusicQueue', ECitadelUserMessageIds.k_EUserMsg_MusicQueue, CCitadelUserMsg_MusicQueue), // 358
    citadelUserMessageAG2ParamTrigger = new MessagePacketType('k_EUserMsg_AG2ParamTrigger', ECitadelUserMessageIds.k_EUserMsg_AG2ParamTrigger, CCitadelUserMsg_AG2ParamTrigger), // 359
    citadelUserMessageItemPurchaseNotification = new MessagePacketType('k_EUserMsg_ItemPurchaseNotification', ECitadelUserMessageIds.k_EUserMsg_ItemPurchaseNotification, CCitadelUserMessage_ItemPurchaseNotification), // 360
    citadelUserMessageEntityPortalled = new MessagePacketType('k_EUserMsg_EntityPortalled', ECitadelUserMessageIds.k_EUserMsg_EntityPortalled, CCitadelUserMsg_EntityPortalled), // 361
    citadelUserMessageStreetBrawlScoring = new MessagePacketType('k_EUserMsg_StreetBrawlScoring', ECitadelUserMessageIds.k_EUserMsg_StreetBrawlScoring, CCitadelUserMsg_StreetBrawlScoring), // 362
    citadelUserMessageHudGameAnnouncement = new MessagePacketType('k_EUserMsg_HudGameAnnouncement', ECitadelUserMessageIds.k_EUserMsg_HudGameAnnouncement, CCitadelUserMsg_HudGameAnnouncement), // 363
    citadelUserMessageItemDraftReaction = new MessagePacketType('k_EUserMsg_ItemDraftReaction', ECitadelUserMessageIds.k_EUserMsg_ItemDraftReaction, CCitadelUserMsg_ItemDraftReaction), // 364
    citadelUserMessageImportantAbilityUsed = new MessagePacketType('k_EUserMsg_ImportantAbilityUsed', ECitadelUserMessageIds.k_EUserMsg_ImportantAbilityUsed, CCitadelUserMessage_ImportantAbilityUsed); // 365

const TE_EffectDispatch = new MessagePacketType('TE_EffectDispatch', ETemporaryEntityIds.TE_EffectDispatchId, CMsgTEEffectDispatch); // 400

const GE_FireBullets = new MessagePacketType('GE_FireBullets', ECitadelGameEvents.GE_FireBullets, CMsgFireBullets), // 450
    GE_PlayerAnimEvent = new MessagePacketType('GE_PlayerAnimEvent', ECitadelGameEvents.GE_PlayerAnimEvent, CMsgPlayerAnimEvent), // 451
    GE_ParticleSystemManager = new MessagePacketType('GE_ParticleSystemManager', ECitadelGameEvents.GE_ParticleSystemManager, CMsgParticleSystemManager), // 458
    GE_ScreenTextPretty = new MessagePacketType('GE_ScreenTextPretty', ECitadelGameEvents.GE_ScreenTextPretty, CMsgScreenTextPretty), // 459
    // GE_ServerRequestedTracer = new MessagePacketType('GE_ServerRequestedTracer', ECitadelGameEvents.GE_ServerRequestedTracer, CMsgServerRequestedTracer), // 460
    GE_BulletImpact = new MessagePacketType('GE_BulletImpact', ECitadelGameEvents.GE_BulletImpact, CMsgBulletImpact), // 461
    GE_EnableSatVolumesEvent = new MessagePacketType('GE_EnableSatVolumesEvent', ECitadelGameEvents.GE_EnableSatVolumesEvent, CMsgEnableSatVolumesEvent), // 462
    GE_PlaceSatVolumeEvent = new MessagePacketType('GE_PlaceSatVolumeEvent', ECitadelGameEvents.GE_PlaceSatVolumeEvent, CMsgPlaceSatVolumeEvent), // 463
    GE_DisableSatVolumesEvent = new MessagePacketType('GE_DisableSatVolumesEvent', ECitadelGameEvents.GE_DisableSatVolumesEvent, CMsgDisableSatVolumesEvent), // 464
    GE_RemoveSatVolumeEvent = new MessagePacketType('GE_RemoveSatVolumeEvent', ECitadelGameEvents.GE_RemoveSatVolumeEvent, CMsgRemoveSatVolumeEvent), // 465
    GE_RemoveBullet = new MessagePacketType('GE_RemoveBullet', ECitadelGameEvents.GE_RemoveBullet, CMsgRemoveBullet); // 466

const citadelEntityMessageBreakablePropSpawnDebris = new MessagePacketType('k_EEntityMsg_BreakablePropSpawnDebris', ECitadelEntityMessageIds.k_EEntityMsg_BreakablePropSpawnDebris, CCitadelEntityMsg_BreakablePropSpawnDebris); // 500

export default MessagePacketType;
