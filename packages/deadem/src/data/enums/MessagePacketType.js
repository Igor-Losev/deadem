import EngineMessagePacketType from '@deademx/engine/src/data/enums/MessagePacketType.js';

class MessagePacketType extends EngineMessagePacketType {
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
    static get CITADEL_USER_MESSAGE_BANNED_HEROES() { return citadelUserMessageBannedHeroes; }

    static get GE_FIRE_BULLETS() { return GE_FireBullets; }
    static get GE_PLAYER_ANIM_EVENT() { return GE_PlayerAnimEvent; }
    static get GE_PARTICLE_SYSTEM_MANAGER() { return GE_ParticleSystemManager; }
    static get GE_SCREEN_TEXT_PRETTY() { return GE_ScreenTextPretty; }
    static get GE_BULLET_IMPACT() { return GE_BulletImpact; }
    static get GE_ENABLE_SAT_VOLUMES_EVENT() { return GE_EnableSatVolumesEvent; }
    static get GE_PLACE_SAT_VOLUME_EVENT() { return GE_PlaceSatVolumeEvent; }
    static get GE_DISABLE_SAT_VOLUME_EVENT() { return GE_DisableSatVolumesEvent; }
    static get GE_REMOVE_SAT_VOLUME_EVENT() { return GE_RemoveSatVolumeEvent; }
    static get GE_REMOVE_BULLET() { return GE_RemoveBullet; }

    static get CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS() { return citadelEntityMessageBreakablePropSpawnDebris; }
}

const citadelUserMessageDamage = new MessagePacketType('k_EUserMsg_Damage', 300);
const citadelUserMessageMapPing = new MessagePacketType('k_EUserMsg_MapPing', 303);
const citadelUserMessageTeamRewards = new MessagePacketType('k_EUserMsg_TeamRewards', 304);
const citadelUserMessageTriggerDamageFlash = new MessagePacketType('k_EUserMsg_TriggerDamageFlash', 308);
const citadelUserMessageAbilitiesChanged = new MessagePacketType('k_EUserMsg_AbilitiesChanged', 309);
const citadelUserMessageRecentDamageSummary = new MessagePacketType('k_EUserMsg_RecentDamageSummary', 310);
const citadelUserMessageSpectatorTeamChanged = new MessagePacketType('k_EUserMsg_SpectatorTeamChanged', 311);
const citadelUserMessageChatWheel = new MessagePacketType('k_EUserMsg_ChatWheel', 312);
const citadelUserMessageGoldHistory = new MessagePacketType('k_EUserMsg_GoldHistory', 313);
const citadelUserMessageChatMessage = new MessagePacketType('k_EUserMsg_ChatMsg', 314);
const citadelUserMessageQuickResponse = new MessagePacketType('k_EUserMsg_QuickResponse', 315);
const citadelUserMessagePostMatchDetails = new MessagePacketType('k_EUserMsg_PostMatchDetails', 316);
const citadelUserMessageChatEvent = new MessagePacketType('k_EUserMsg_ChatEvent', 317);
const citadelUserMessageAbilityInterrupted = new MessagePacketType('k_EUserMsg_AbilityInterrupted', 318);
const citadelUserMessageHeroKilled = new MessagePacketType('k_EUserMsg_HeroKilled', 319);
const citadelUserMessageReturnIdol = new MessagePacketType('k_EUserMsg_ReturnIdol', 320);
const citadelUserMessageSetClientCameraAngles = new MessagePacketType('k_EUserMsg_SetClientCameraAngles', 321);
const citadelUserMessageMapLine = new MessagePacketType('k_EUserMsg_MapLine', 322);
const citadelUserMessageBulletHit = new MessagePacketType('k_EUserMsg_BulletHit', 323);
const citadelUserMessageObjectiveMask = new MessagePacketType('k_EUserMsg_ObjectiveMask', 324);
const citadelUserMessageModifierApplied = new MessagePacketType('k_EUserMsg_ModifierApplied', 325);
const citadelUserMessageCameraController = new MessagePacketType('k_EUserMsg_CameraController', 326);
const citadelUserMessageAuraModifierApplied = new MessagePacketType('k_EUserMsg_AuraModifierApplied', 327);
const citadelUserMessageObstructedShotFired = new MessagePacketType('k_EUserMsg_ObstructedShotFired', 329);
const citadelUserMessageAbilityLateFailure = new MessagePacketType('k_EUserMsg_AbilityLateFailure', 330);
const citadelUserMessageAbilityPing = new MessagePacketType('k_EUserMsg_AbilityPing', 331);
const citadelUserMessagePostProcessingAnim = new MessagePacketType('k_EUserMsg_PostProcessingAnim', 332);
const citadelUserMessageDeathReplayData = new MessagePacketType('k_EUserMsg_DeathReplayData', 333);
const citadelUserMessagePlayerLifetimeStatInfo = new MessagePacketType('k_EUserMsg_PlayerLifetimeStatInfo', 334);
const citadelUserMessageForceShopClosed = new MessagePacketType('k_EUserMsg_ForceShopClosed', 336);
const citadelUserMessageStaminaConsumed = new MessagePacketType('k_EUserMsg_StaminaConsumed', 337);
const citadelUserMessageAbilityNotify = new MessagePacketType('k_EUserMsg_AbilityNotify', 338);
const citadelUserMessageGetDamageStatsResponse = new MessagePacketType('k_EUserMsg_GetDamageStatsResponse', 339);
const citadelUserMessageParticipantStartSoundEvent = new MessagePacketType('k_EUserMsg_ParticipantStartSoundEvent', 340);
const citadelUserMessageParticipantStopSoundEvent = new MessagePacketType('k_EUserMsg_ParticipantStopSoundEvent', 341);
const citadelUserMessageParticipantStopSoundEventHash = new MessagePacketType('k_EUserMsg_ParticipantStopSoundEventHash', 342);
const citadelUserMessageParticipantSetSoundEventParams = new MessagePacketType('k_EUserMsg_ParticipantSetSoundEventParams', 343);
const citadelUserMessageParticipantSetLibraryStackFields = new MessagePacketType('k_EUserMsg_ParticipantSetLibraryStackFields', 344);
const citadelUserMessageCurrencyChanged = new MessagePacketType('k_EUserMsg_CurrencyChanged', 345);
const citadelUserMessageGameOver = new MessagePacketType('k_EUserMsg_GameOver', 346);
const citadelUserMessageBossKilled = new MessagePacketType('k_EUserMsg_BossKilled', 347);
const citadelUserMessageBossDamaged = new MessagePacketType('k_EUserMsg_BossDamaged', 348);
const citadelUserMessageMidBossSpawned = new MessagePacketType('k_EUserMsg_MidBossSpawned', 349);
const citadelUserMessageRejuvStatus = new MessagePacketType('k_EUserMsg_RejuvStatus', 350);
const citadelUserMessageKillStreak = new MessagePacketType('k_EUserMsg_KillStreak', 351);
const citadelUserMessageTeamMsg = new MessagePacketType('k_EUserMsg_TeamMsg', 352);
const citadelUserMessagePlayerRespawned = new MessagePacketType('k_EUserMsg_PlayerRespawned', 353);
const citadelUserMessageCallCheaterVote = new MessagePacketType('k_EUserMsg_CallCheaterVote', 354);
const citadelUserMessageMeleeHit = new MessagePacketType('k_EUserMsg_MeleeHit', 355);
const citadelUserMessageFlexSlotUnlocked = new MessagePacketType('k_EUserMsg_FlexSlotUnlocked', 356);
const citadelUserMessageSeasonalKill = new MessagePacketType('k_EUserMsg_SeasonalKill', 357);
const citadelUserMessageMusicQueue = new MessagePacketType('k_EUserMsg_MusicQueue', 358);
const citadelUserMessageAG2ParamTrigger = new MessagePacketType('k_EUserMsg_AG2ParamTrigger', 359);
const citadelUserMessageItemPurchaseNotification = new MessagePacketType('k_EUserMsg_ItemPurchaseNotification', 360);
const citadelUserMessageEntityPortalled = new MessagePacketType('k_EUserMsg_EntityPortalled', 361);
const citadelUserMessageStreetBrawlScoring = new MessagePacketType('k_EUserMsg_StreetBrawlScoring', 362);
const citadelUserMessageHudGameAnnouncement = new MessagePacketType('k_EUserMsg_HudGameAnnouncement', 363);
const citadelUserMessageItemDraftReaction = new MessagePacketType('k_EUserMsg_ItemDraftReaction', 364);
const citadelUserMessageImportantAbilityUsed = new MessagePacketType('k_EUserMsg_ImportantAbilityUsed', 365);
const citadelUserMessageBannedHeroes = new MessagePacketType('k_EUserMsg_BannedHeroes', 366);

const GE_FireBullets = new MessagePacketType('GE_FireBullets', 450);
const GE_PlayerAnimEvent = new MessagePacketType('GE_PlayerAnimEvent', 451);
const GE_ParticleSystemManager = new MessagePacketType('GE_ParticleSystemManager', 458);
const GE_ScreenTextPretty = new MessagePacketType('GE_ScreenTextPretty', 459);
const GE_BulletImpact = new MessagePacketType('GE_BulletImpact', 461);
const GE_EnableSatVolumesEvent = new MessagePacketType('GE_EnableSatVolumesEvent', 462);
const GE_PlaceSatVolumeEvent = new MessagePacketType('GE_PlaceSatVolumeEvent', 463);
const GE_DisableSatVolumesEvent = new MessagePacketType('GE_DisableSatVolumesEvent', 464);
const GE_RemoveSatVolumeEvent = new MessagePacketType('GE_RemoveSatVolumeEvent', 465);
const GE_RemoveBullet = new MessagePacketType('GE_RemoveBullet', 466);

const citadelEntityMessageBreakablePropSpawnDebris = new MessagePacketType('k_EEntityMsg_BreakablePropSpawnDebris', 500);

export default MessagePacketType;
