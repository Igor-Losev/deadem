import EngineBootstrap from '@deademx/engine/src/bootstrap/Bootstrap.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Deadlock-specific (Citadel) user messages and game events on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerCitadelUserMessages(registry);
        Bootstrap._registerCitadelGameEvents(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelUserMessages(registry) {
        const um = registry.getProtoProvider().CITADEL_USER_MESSAGES;

        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE, um.lookupType('CCitadelUserMessage_Damage'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MAP_PING, um.lookupType('CCitadelUserMsg_MapPing'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TEAM_REWARDS, um.lookupType('CCitadelUserMsg_TeamRewards'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TRIGGER_DAMAGE_FLASH, um.lookupType('CCitadelUserMsg_TriggerDamageFlash'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_CHANGED, um.lookupType('CCitadelUserMsg_AbilitiesChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_RECENT_DAMAGE_SUMMARY, um.lookupType('CCitadelUserMsg_RecentDamageSummary'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SPECTATOR_TEAM_CHANGED, um.lookupType('CCitadelUserMsg_SpectatorTeamChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL, um.lookupType('CCitadelUserMsg_ChatWheel'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GOLD_HISTORY, um.lookupType('CCitadelUserMsg_GoldHistory'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE, um.lookupType('CCitadelUserMsg_ChatMsg'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_QUICK_RESPONSE, um.lookupType('CCitadelUserMsg_QuickResponse'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_POST_MATCH_DETAILS, um.lookupType('CCitadelUserMsg_PostMatchDetails'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_EVENT, um.lookupType('CCitadelUserMsg_ChatEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_INTERRUPTED, um.lookupType('CCitadelUserMsg_AbilityInterrupted'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_HERO_KILLED, um.lookupType('CCitadelUserMsg_HeroKilled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_RETURN_IDOL, um.lookupType('CCitadelUserMsg_ReturnIdol'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SET_CLIENT_CAMERA_ANGLES, um.lookupType('CCitadelUserMsg_SetClientCameraAngles'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MAP_LINE, um.lookupType('CCitadelUserMsg_MapLine'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BULLET_HIT, um.lookupType('CCitadelUserMessage_BulletHit'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_OBJECTIVE_MASK, um.lookupType('CCitadelUserMessage_ObjectiveMask'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MODIFIER_APPLIED, um.lookupType('CCitadelUserMessage_ModifierApplied'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CAMERA_CONTROLLER, um.lookupType('CCitadelUserMsg_CameraController'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_AURA_MODIFIER_APPLIED, um.lookupType('CCitadelUserMessage_AuraModifierApplied'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_OBSTRUCTED_SHOT_FIRED, um.lookupType('CCitadelUserMsg_ObstructedShotFired'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_LATE_FAILURE, um.lookupType('CCitadelUserMsg_AbilityLateFailure'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_PING, um.lookupType('CCitadelUserMsg_AbilityPing'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_POST_PROCESSING_ANIM, um.lookupType('CCitadelUserMsg_PostProcessingAnim'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_DEATH_REPLAY_DATA, um.lookupType('CCitadelUserMsg_DeathReplayData'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_LIFETIME_STAT_INFO, um.lookupType('CCitadelUserMsg_PlayerLifetimeStatInfo'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_FORCE_SHOP_CLOSED, um.lookupType('CCitadelUserMsg_ForceShopClosed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_STAMINA_CONSUMED, um.lookupType('CCitadelUserMsg_StaminaConsumed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_NOTIFY, um.lookupType('CCitadelUserMessage_AbilityNotify'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GET_DAMAGE_STATS_RESPONSE, um.lookupType('CCitadelUserMsg_GetDamageStatsResponse'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_START_SOUND_EVENT, um.lookupType('CCitadelUserMsg_ParticipantStartSoundEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT, um.lookupType('CCitadelUserMsg_ParticipantStopSoundEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT_HASH, um.lookupType('CCitadelUserMsg_ParticipantStopSoundEventHash'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_SOUND_EVENT_PARAMS, um.lookupType('CCitadelUserMsg_ParticipantSetSoundEventParams'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_LIBRARY_STACK_FIELDS, um.lookupType('CCitadelUserMsg_ParticipantSetLibraryStackFields'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CURRENCY_CHANGED, um.lookupType('CCitadelUserMessage_CurrencyChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GAME_OVER, um.lookupType('CCitadelUserMessage_GameOver'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED, um.lookupType('CCitadelUserMsg_BossKilled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BOSS_DAMAGED, um.lookupType('CCitadelUserMsg_BossDamaged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED, um.lookupType('CCitadelUserMsg_MidBossSpawned'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_REJUV_STATUS, um.lookupType('CCitadelUserMsg_RejuvStatus'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_KILL_STREAK, um.lookupType('CCitadelUserMsg_KillStreak'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TEAM_MSG, um.lookupType('CCitadelUserMsg_TeamMsg'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_RESPAWNED, um.lookupType('CCitadelUserMsg_PlayerRespawned'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CALL_CHEATER_VOTE, um.lookupType('CCitadelUserMsg_CallCheaterVote'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MELEE_HIT, um.lookupType('CCitadelUserMessage_MeleeHit'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_FLEX_SLOT_UNLOCKED, um.lookupType('CCitadelUserMsg_FlexSlotUnlocked'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SEASONAL_ACHIEVEMENT_UNLOCKED, um.lookupType('CCitadelUserMsg_SeasonalKill'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MUSIC_QUEUE, um.lookupType('CCitadelUserMsg_MusicQueue'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_AG2_PARAM_TRIGGER, um.lookupType('CCitadelUserMsg_AG2ParamTrigger'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ITEM_PURCHASE_NOTIFICATION, um.lookupType('CCitadelUserMessage_ItemPurchaseNotification'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ENTITY_PORTALLED, um.lookupType('CCitadelUserMsg_EntityPortalled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_STREET_BRAWL_SCORING, um.lookupType('CCitadelUserMsg_StreetBrawlScoring'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_HUD_GAME_ANNOUNCEMENT, um.lookupType('CCitadelUserMsg_HudGameAnnouncement'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ITEM_DRAFT_REACTION, um.lookupType('CCitadelUserMsg_ItemDraftReaction'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED, um.lookupType('CCitadelUserMessage_ImportantAbilityUsed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BANNED_HEROES, um.lookupType('CCitadelUserMsg_BannedHeroes'));

        registry.registerMessageType(MessagePacketType.CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS, um.lookupType('CCitadelEntityMsg_BreakablePropSpawnDebris'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelGameEvents(registry) {
        const ge = registry.getProtoProvider().CITADEL_GAME_EVENTS;

        registry.registerMessageType(MessagePacketType.GE_FIRE_BULLETS, ge.lookupType('CMsgFireBullets'));
        registry.registerMessageType(MessagePacketType.GE_PLAYER_ANIM_EVENT, ge.lookupType('CMsgPlayerAnimEvent'));
        registry.registerMessageType(MessagePacketType.GE_PARTICLE_SYSTEM_MANAGER, ge.lookupType('CMsgParticleSystemManager'));
        registry.registerMessageType(MessagePacketType.GE_SCREEN_TEXT_PRETTY, ge.lookupType('CMsgScreenTextPretty'));
        registry.registerMessageType(MessagePacketType.GE_BULLET_IMPACT, ge.lookupType('CMsgBulletImpact'));
        registry.registerMessageType(MessagePacketType.GE_ENABLE_SAT_VOLUMES_EVENT, ge.lookupType('CMsgEnableSatVolumesEvent'));
        registry.registerMessageType(MessagePacketType.GE_PLACE_SAT_VOLUME_EVENT, ge.lookupType('CMsgPlaceSatVolumeEvent'));
        registry.registerMessageType(MessagePacketType.GE_DISABLE_SAT_VOLUME_EVENT, ge.lookupType('CMsgDisableSatVolumesEvent'));
        registry.registerMessageType(MessagePacketType.GE_REMOVE_SAT_VOLUME_EVENT, ge.lookupType('CMsgRemoveSatVolumeEvent'));
        registry.registerMessageType(MessagePacketType.GE_REMOVE_BULLET, ge.lookupType('CMsgRemoveBullet'));
    }
}

export default Bootstrap;
