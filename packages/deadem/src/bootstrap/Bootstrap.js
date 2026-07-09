import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Deadlock-specific (Citadel) field rules, user messages, game events, and
 * string table types on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerCitadelFieldRules(registry);
        Bootstrap._registerCitadelUserMessages(registry);
        Bootstrap._registerCitadelGameEvents(registry);
        Bootstrap._registerCitadelStringTableTypes(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelFieldRules(registry) {
        registry.registerFieldTypeDecoder('HeroID_t', FieldDecoderDescriptor.VAR_UINT_32);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelUserMessages(registry) {
        const pp = registry.getProtoProvider();

        registry.registerMessageType(MessagePacketType.ENTITY_MESSAGE_REMOVE_ALL_DECALS, pp.USER_MESSAGES.lookupType('CEntityMessageRemoveAllDecals'));

        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_Damage'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MAP_PING, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MapPing'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TEAM_REWARDS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TeamRewards'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TRIGGER_DAMAGE_FLASH, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TriggerDamageFlash'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_CHANGED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilitiesChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_RECENT_DAMAGE_SUMMARY, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_RecentDamageSummary'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SPECTATOR_TEAM_CHANGED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SpectatorTeamChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatWheel'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GOLD_HISTORY, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_GoldHistory'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatMsg'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_QUICK_RESPONSE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_QuickResponse'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_POST_MATCH_DETAILS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PostMatchDetails'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CHAT_EVENT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ChatEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_INTERRUPTED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityInterrupted'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_HERO_KILLED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_HeroKilled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_RETURN_IDOL, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ReturnIdol'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SET_CLIENT_CAMERA_ANGLES, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SetClientCameraAngles'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MAP_LINE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MapLine'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BULLET_HIT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_BulletHit'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_OBJECTIVE_MASK, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ObjectiveMask'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MODIFIER_APPLIED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ModifierApplied'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CAMERA_CONTROLLER, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_CameraController'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_AURA_MODIFIER_APPLIED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_AuraModifierApplied'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_OBSTRUCTED_SHOT_FIRED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ObstructedShotFired'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_LATE_FAILURE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityLateFailure'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_PING, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AbilityPing'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_POST_PROCESSING_ANIM, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PostProcessingAnim'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_DEATH_REPLAY_DATA, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_DeathReplayData'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_LIFETIME_STAT_INFO, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PlayerLifetimeStatInfo'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_FORCE_SHOP_CLOSED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ForceShopClosed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_STAMINA_CONSUMED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_StaminaConsumed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_NOTIFY, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_AbilityNotify'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GET_DAMAGE_STATS_RESPONSE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_GetDamageStatsResponse'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_START_SOUND_EVENT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStartSoundEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStopSoundEvent'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT_HASH, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantStopSoundEventHash'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_SOUND_EVENT_PARAMS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantSetSoundEventParams'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_LIBRARY_STACK_FIELDS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ParticipantSetLibraryStackFields'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CURRENCY_CHANGED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_CurrencyChanged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_GAME_OVER, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_GameOver'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_BossKilled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BOSS_DAMAGED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_BossDamaged'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_MidBossSpawned'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_REJUV_STATUS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_RejuvStatus'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_KILL_STREAK, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_KillStreak'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_TEAM_MSG, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_TeamMsg'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_RESPAWNED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_PlayerRespawned'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_CALL_CHEATER_VOTE, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_CallCheaterVote'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_MELEE_HIT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_MeleeHit'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_FLEX_SLOT_UNLOCKED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_FlexSlotUnlocked'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_SEASONAL_ACHIEVEMENT_UNLOCKED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_SeasonalKill'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_AG2_PARAM_TRIGGER, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_AG2ParamTrigger'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ITEM_PURCHASE_NOTIFICATION, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ItemPurchaseNotification'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ENTITY_PORTALLED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_EntityPortalled'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_STREET_BRAWL_SCORING, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_StreetBrawlScoring'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_HUD_GAME_ANNOUNCEMENT, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_HudGameAnnouncement'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_ITEM_DRAFT_REACTION, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_ItemDraftReaction'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMessage_ImportantAbilityUsed'));
        registry.registerMessageType(MessagePacketType.CITADEL_USER_MESSAGE_BANNED_HEROES, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelUserMsg_BannedHeroes'));

        registry.registerMessageType(MessagePacketType.CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS, pp.CITADEL_USER_MESSAGES.lookupType('CCitadelEntityMsg_BreakablePropSpawnDebris'));
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

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelStringTableTypes(registry) {
        const pp = registry.getProtoProvider();

        const modifierProto = pp.BASE_MODIFIER.lookupType('CModifierTableEntry');
        const modifierDecoder = buffer => modifierProto.decode(buffer);

        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS, modifierDecoder);
    }
}

export default Bootstrap;
