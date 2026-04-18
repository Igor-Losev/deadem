import EngineBootstrap from '@deadem/engine/src/Bootstrap.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';

class Bootstrap extends EngineBootstrap {
    /**
     * @public
     * @static
     * @param {ProtoProvider} pp
     */
    static run(pp) {
        super.run(pp);

        Bootstrap._initCitadelUserMessages(pp);
        Bootstrap._initCitadelGameEvents(pp);
    }

    static _initCitadelUserMessages(pp) {
        const um = pp.CITADEL_USER_MESSAGES;

        MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE.proto = um.lookupType('CCitadelUserMessage_Damage');
        MessagePacketType.CITADEL_USER_MESSAGE_MAP_PING.proto = um.lookupType('CCitadelUserMsg_MapPing');
        MessagePacketType.CITADEL_USER_MESSAGE_TEAM_REWARDS.proto = um.lookupType('CCitadelUserMsg_TeamRewards');
        MessagePacketType.CITADEL_USER_MESSAGE_TRIGGER_DAMAGE_FLASH.proto = um.lookupType('CCitadelUserMsg_TriggerDamageFlash');
        MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_CHANGED.proto = um.lookupType('CCitadelUserMsg_AbilitiesChanged');
        MessagePacketType.CITADEL_USER_MESSAGE_RECENT_DAMAGE_SUMMARY.proto = um.lookupType('CCitadelUserMsg_RecentDamageSummary');
        MessagePacketType.CITADEL_USER_MESSAGE_SPECTATOR_TEAM_CHANGED.proto = um.lookupType('CCitadelUserMsg_SpectatorTeamChanged');
        MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL.proto = um.lookupType('CCitadelUserMsg_ChatWheel');
        MessagePacketType.CITADEL_USER_MESSAGE_GOLD_HISTORY.proto = um.lookupType('CCitadelUserMsg_GoldHistory');
        MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE.proto = um.lookupType('CCitadelUserMsg_ChatMsg');
        MessagePacketType.CITADEL_USER_MESSAGE_QUICK_RESPONSE.proto = um.lookupType('CCitadelUserMsg_QuickResponse');
        MessagePacketType.CITADEL_USER_MESSAGE_POST_MATCH_DETAILS.proto = um.lookupType('CCitadelUserMsg_PostMatchDetails');
        MessagePacketType.CITADEL_USER_MESSAGE_CHAT_EVENT.proto = um.lookupType('CCitadelUserMsg_ChatEvent');
        MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_INTERRUPTED.proto = um.lookupType('CCitadelUserMsg_AbilityInterrupted');
        MessagePacketType.CITADEL_USER_MESSAGE_HERO_KILLED.proto = um.lookupType('CCitadelUserMsg_HeroKilled');
        MessagePacketType.CITADEL_USER_MESSAGE_RETURN_IDOL.proto = um.lookupType('CCitadelUserMsg_ReturnIdol');
        MessagePacketType.CITADEL_USER_MESSAGE_SET_CLIENT_CAMERA_ANGLES.proto = um.lookupType('CCitadelUserMsg_SetClientCameraAngles');
        MessagePacketType.CITADEL_USER_MESSAGE_MAP_LINE.proto = um.lookupType('CCitadelUserMsg_MapLine');
        MessagePacketType.CITADEL_USER_MESSAGE_BULLET_HIT.proto = um.lookupType('CCitadelUserMessage_BulletHit');
        MessagePacketType.CITADEL_USER_MESSAGE_OBJECTIVE_MASK.proto = um.lookupType('CCitadelUserMessage_ObjectiveMask');
        MessagePacketType.CITADEL_USER_MESSAGE_MODIFIER_APPLIED.proto = um.lookupType('CCitadelUserMessage_ModifierApplied');
        MessagePacketType.CITADEL_USER_MESSAGE_CAMERA_CONTROLLER.proto = um.lookupType('CCitadelUserMsg_CameraController');
        MessagePacketType.CITADEL_USER_MESSAGE_AURA_MODIFIER_APPLIED.proto = um.lookupType('CCitadelUserMessage_AuraModifierApplied');
        MessagePacketType.CITADEL_USER_MESSAGE_OBSTRUCTED_SHOT_FIRED.proto = um.lookupType('CCitadelUserMsg_ObstructedShotFired');
        MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_LATE_FAILURE.proto = um.lookupType('CCitadelUserMsg_AbilityLateFailure');
        MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_PING.proto = um.lookupType('CCitadelUserMsg_AbilityPing');
        MessagePacketType.CITADEL_USER_MESSAGE_POST_PROCESSING_ANIM.proto = um.lookupType('CCitadelUserMsg_PostProcessingAnim');
        MessagePacketType.CITADEL_USER_MESSAGE_DEATH_REPLAY_DATA.proto = um.lookupType('CCitadelUserMsg_DeathReplayData');
        MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_LIFETIME_STAT_INFO.proto = um.lookupType('CCitadelUserMsg_PlayerLifetimeStatInfo');
        MessagePacketType.CITADEL_USER_MESSAGE_FORCE_SHOP_CLOSED.proto = um.lookupType('CCitadelUserMsg_ForceShopClosed');
        MessagePacketType.CITADEL_USER_MESSAGE_STAMINA_CONSUMED.proto = um.lookupType('CCitadelUserMsg_StaminaConsumed');
        MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_NOTIFY.proto = um.lookupType('CCitadelUserMessage_AbilityNotify');
        MessagePacketType.CITADEL_USER_MESSAGE_GET_DAMAGE_STATS_RESPONSE.proto = um.lookupType('CCitadelUserMsg_GetDamageStatsResponse');
        MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_START_SOUND_EVENT.proto = um.lookupType('CCitadelUserMsg_ParticipantStartSoundEvent');
        MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT.proto = um.lookupType('CCitadelUserMsg_ParticipantStopSoundEvent');
        MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_STOP_SOUND_EVENT_HASH.proto = um.lookupType('CCitadelUserMsg_ParticipantStopSoundEventHash');
        MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_SOUND_EVENT_PARAMS.proto = um.lookupType('CCitadelUserMsg_ParticipantSetSoundEventParams');
        MessagePacketType.CITADEL_USER_MESSAGE_PARTICIPANT_SET_LIBRARY_STACK_FIELDS.proto = um.lookupType('CCitadelUserMsg_ParticipantSetLibraryStackFields');
        MessagePacketType.CITADEL_USER_MESSAGE_CURRENCY_CHANGED.proto = um.lookupType('CCitadelUserMessage_CurrencyChanged');
        MessagePacketType.CITADEL_USER_MESSAGE_GAME_OVER.proto = um.lookupType('CCitadelUserMessage_GameOver');
        MessagePacketType.CITADEL_USER_MESSAGE_BOSS_KILLED.proto = um.lookupType('CCitadelUserMsg_BossKilled');
        MessagePacketType.CITADEL_USER_MESSAGE_BOSS_DAMAGED.proto = um.lookupType('CCitadelUserMsg_BossDamaged');
        MessagePacketType.CITADEL_USER_MESSAGE_MID_BOSS_SPAWNED.proto = um.lookupType('CCitadelUserMsg_MidBossSpawned');
        MessagePacketType.CITADEL_USER_MESSAGE_REJUV_STATUS.proto = um.lookupType('CCitadelUserMsg_RejuvStatus');
        MessagePacketType.CITADEL_USER_MESSAGE_KILL_STREAK.proto = um.lookupType('CCitadelUserMsg_KillStreak');
        MessagePacketType.CITADEL_USER_MESSAGE_TEAM_MSG.proto = um.lookupType('CCitadelUserMsg_TeamMsg');
        MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_RESPAWNED.proto = um.lookupType('CCitadelUserMsg_PlayerRespawned');
        MessagePacketType.CITADEL_USER_MESSAGE_CALL_CHEATER_VOTE.proto = um.lookupType('CCitadelUserMsg_CallCheaterVote');
        MessagePacketType.CITADEL_USER_MESSAGE_MELEE_HIT.proto = um.lookupType('CCitadelUserMessage_MeleeHit');
        MessagePacketType.CITADEL_USER_MESSAGE_FLEX_SLOT_UNLOCKED.proto = um.lookupType('CCitadelUserMsg_FlexSlotUnlocked');
        MessagePacketType.CITADEL_USER_MESSAGE_SEASONAL_ACHIEVEMENT_UNLOCKED.proto = um.lookupType('CCitadelUserMsg_SeasonalKill');
        MessagePacketType.CITADEL_USER_MESSAGE_MUSIC_QUEUE.proto = um.lookupType('CCitadelUserMsg_MusicQueue');
        MessagePacketType.CITADEL_USER_MESSAGE_AG2_PARAM_TRIGGER.proto = um.lookupType('CCitadelUserMsg_AG2ParamTrigger');
        MessagePacketType.CITADEL_USER_MESSAGE_ITEM_PURCHASE_NOTIFICATION.proto = um.lookupType('CCitadelUserMessage_ItemPurchaseNotification');
        MessagePacketType.CITADEL_USER_MESSAGE_ENTITY_PORTALLED.proto = um.lookupType('CCitadelUserMsg_EntityPortalled');
        MessagePacketType.CITADEL_USER_MESSAGE_STREET_BRAWL_SCORING.proto = um.lookupType('CCitadelUserMsg_StreetBrawlScoring');
        MessagePacketType.CITADEL_USER_MESSAGE_HUD_GAME_ANNOUNCEMENT.proto = um.lookupType('CCitadelUserMsg_HudGameAnnouncement');
        MessagePacketType.CITADEL_USER_MESSAGE_ITEM_DRAFT_REACTION.proto = um.lookupType('CCitadelUserMsg_ItemDraftReaction');
        MessagePacketType.CITADEL_USER_MESSAGE_IMPORTANT_ABILITY_USED.proto = um.lookupType('CCitadelUserMessage_ImportantAbilityUsed');
        MessagePacketType.CITADEL_USER_MESSAGE_BANNED_HEROES.proto = um.lookupType('CCitadelUserMsg_BannedHeroes');

        MessagePacketType.CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS.proto = um.lookupType('CCitadelEntityMsg_BreakablePropSpawnDebris');
    }

    static _initCitadelGameEvents(pp) {
        const ge = pp.CITADEL_GAME_EVENTS;

        MessagePacketType.GE_FIRE_BULLETS.proto = ge.lookupType('CMsgFireBullets');
        MessagePacketType.GE_PLAYER_ANIM_EVENT.proto = ge.lookupType('CMsgPlayerAnimEvent');
        MessagePacketType.GE_PARTICLE_SYSTEM_MANAGER.proto = ge.lookupType('CMsgParticleSystemManager');
        MessagePacketType.GE_SCREEN_TEXT_PRETTY.proto = ge.lookupType('CMsgScreenTextPretty');
        MessagePacketType.GE_BULLET_IMPACT.proto = ge.lookupType('CMsgBulletImpact');
        MessagePacketType.GE_ENABLE_SAT_VOLUMES_EVENT.proto = ge.lookupType('CMsgEnableSatVolumesEvent');
        MessagePacketType.GE_PLACE_SAT_VOLUME_EVENT.proto = ge.lookupType('CMsgPlaceSatVolumeEvent');
        MessagePacketType.GE_DISABLE_SAT_VOLUME_EVENT.proto = ge.lookupType('CMsgDisableSatVolumesEvent');
        MessagePacketType.GE_REMOVE_SAT_VOLUME_EVENT.proto = ge.lookupType('CMsgRemoveSatVolumeEvent');
        MessagePacketType.GE_REMOVE_BULLET.proto = ge.lookupType('CMsgRemoveBullet');
    }

}

export default Bootstrap;
