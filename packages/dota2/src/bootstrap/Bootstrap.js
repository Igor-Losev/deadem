import EngineBootstrap from '@deadem/engine/src/bootstrap/Bootstrap.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Dota 2-specific user messages on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerDotaUserMessages(registry);
        Bootstrap._registerStringTableTypes(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDotaUserMessages(registry) {
        const um = registry.getProtoProvider().DOTA_USER_MESSAGES;

        registry.registerMessageType(MessagePacketType.DOTA_UM_AI_DEBUG_LINE, um.lookupType('CDOTAUserMsg_AIDebugLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_EVENT, um.lookupType('CDOTAUserMsg_ChatEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_HERO_POSITIONS, um.lookupType('CDOTAUserMsg_CombatHeroPositions'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_LOG_BULK_DATA, um.lookupType('CDOTAUserMsg_CombatLogBulkData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CREATE_LINEAR_PROJECTILE, um.lookupType('CDOTAUserMsg_CreateLinearProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DESTROY_LINEAR_PROJECTILE, um.lookupType('CDOTAUserMsg_DestroyLinearProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DODGE_TRACKING_PROJECTILES, um.lookupType('CDOTAUserMsg_DodgeTrackingProjectiles'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLOBAL_LIGHT_COLOR, um.lookupType('CDOTAUserMsg_GlobalLightColor'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLOBAL_LIGHT_DIRECTION, um.lookupType('CDOTAUserMsg_GlobalLightDirection'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_INVALID_COMMAND, um.lookupType('CDOTAUserMsg_InvalidCommand'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_LOCATION_PING, um.lookupType('CDOTAUserMsg_LocationPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MAP_LINE, um.lookupType('CDOTAUserMsg_MapLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINI_KILL_CAM_INFO, um.lookupType('CDOTAUserMsg_MiniKillCamInfo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINIMAP_DEBUG_POINT, um.lookupType('CDOTAUserMsg_MinimapDebugPoint'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINIMAP_EVENT, um.lookupType('CDOTAUserMsg_MinimapEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEVERMORE_REQUIEM, um.lookupType('CDOTAUserMsg_NevermoreRequiem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OVERHEAD_EVENT, um.lookupType('CDOTAUserMsg_OverheadEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SET_NEXT_AUTOBUY_ITEM, um.lookupType('CDOTAUserMsg_SetNextAutobuyItem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHARED_COOLDOWN, um.lookupType('CDOTAUserMsg_SharedCooldown'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_CLICK, um.lookupType('CDOTAUserMsg_SpectatorPlayerClick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_TIP_INFO, um.lookupType('CDOTAUserMsg_TutorialTipInfo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UNIT_EVENT, um.lookupType('CDOTAUserMsg_UnitEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BOT_CHAT, um.lookupType('CDOTAUserMsg_BotChat'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HUD_ERROR, um.lookupType('CDOTAUserMsg_HudError'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_PURCHASED, um.lookupType('CDOTAUserMsg_ItemPurchased'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PING, um.lookupType('CDOTAUserMsg_Ping'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_FOUND, um.lookupType('CDOTAUserMsg_ItemFound'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SWAP_VERIFY, um.lookupType('CDOTAUserMsg_SwapVerify'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WORLD_LINE, um.lookupType('CDOTAUserMsg_WorldLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_ALERT, um.lookupType('CDOTAUserMsg_ItemAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HALLOWEEN_DROPS, um.lookupType('CDOTAUserMsg_HalloweenDrops'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_WHEEL, um.lookupType('CDOTAUserMsg_ChatWheel'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_RECEIVED_XMAS_GIFT, um.lookupType('CDOTAUserMsg_ReceivedXmasGift'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_SHARED_CONTENT, um.lookupType('CDOTAUserMsg_UpdateSharedContent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_REQUEST_EXP, um.lookupType('CDOTAUserMsg_TutorialRequestExp'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_PING_MINIMAP, um.lookupType('CDOTAUserMsg_TutorialPingMinimap'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GAMERULES_STATE_CHANGED, um.lookupType('CDOTAUserMsg_GamerulesStateChanged'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOW_SURVEY, um.lookupType('CDOTAUserMsg_ShowSurvey'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_FADE, um.lookupType('CDOTAUserMsg_TutorialFade'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ADD_QUEST_LOG_ENTRY, um.lookupType('CDOTAUserMsg_AddQuestLogEntry'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_STAT_POPUP, um.lookupType('CDOTAUserMsg_SendStatPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_FINISH, um.lookupType('CDOTAUserMsg_TutorialFinish'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_ROSHAN_POPUP, um.lookupType('CDOTAUserMsg_SendRoshanPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_GENERIC_TOOL_TIP, um.lookupType('CDOTAUserMsg_SendGenericToolTip'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_FINAL_GOLD, um.lookupType('CDOTAUserMsg_SendFinalGold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_MSG, um.lookupType('CDOTAUserMsg_CustomMsg'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COACH_HUD_PING, um.lookupType('CDOTAUserMsg_CoachHUDPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CLIENT_LOAD_GRID_NAV, um.lookupType('CDOTAUserMsg_ClientLoadGridNav'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_PROJECTILE, um.lookupType('CDOTAUserMsg_TE_Projectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_PROJECTILE_LOC, um.lookupType('CDOTAUserMsg_TE_ProjectileLoc'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_DOTA_BLOOD_IMPACT, um.lookupType('CDOTAUserMsg_TE_DotaBloodImpact'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_UNIT_ANIMATION, um.lookupType('CDOTAUserMsg_TE_UnitAnimation'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_UNIT_ANIMATION_END, um.lookupType('CDOTAUserMsg_TE_UnitAnimationEnd'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_PING, um.lookupType('CDOTAUserMsg_AbilityPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOW_GENERIC_POPUP, um.lookupType('CDOTAUserMsg_ShowGenericPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_START, um.lookupType('CDOTAUserMsg_VoteStart'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_UPDATE, um.lookupType('CDOTAUserMsg_VoteUpdate'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_END, um.lookupType('CDOTAUserMsg_VoteEnd'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BOOSTER_STATE, um.lookupType('CDOTAUserMsg_BoosterState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WILL_PURCHASE_ALERT, um.lookupType('CDOTAUserMsg_WillPurchaseAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_MINIMAP_POSITION, um.lookupType('CDOTAUserMsg_TutorialMinimapPosition'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_STEAL, um.lookupType('CDOTAUserMsg_AbilitySteal'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COURIER_KILLED_ALERT, um.lookupType('CDOTAUserMsg_CourierKilledAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ENEMY_ITEM_ALERT, um.lookupType('CDOTAUserMsg_EnemyItemAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_STATS_MATCH_DETAILS, um.lookupType('CDOTAUserMsg_StatsMatchDetails'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINI_TAUNT, um.lookupType('CDOTAUserMsg_MiniTaunt'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BUY_BACK_STATE_ALERT, um.lookupType('CDOTAUserMsg_BuyBackStateAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPEECH_BUBBLE, um.lookupType('CDOTAUserMsg_SpeechBubble'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HEADER_MESSAGE, um.lookupType('CDOTAUserMsg_CustomHeaderMessage'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUICK_BUY_ALERT, um.lookupType('CDOTAUserMsg_QuickBuyAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MODIFIER_ALERT, um.lookupType('CDOTAUserMsg_ModifierAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HP_MANA_ALERT, um.lookupType('CDOTAUserMsg_HPManaAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLYPH_ALERT, um.lookupType('CDOTAUserMsg_GlyphAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BEAST_CHAT, um.lookupType('CDOTAUserMsg_BeastChat'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS, um.lookupType('CDOTAUserMsg_SpectatorPlayerUnitOrders'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_CREATE, um.lookupType('CDOTAUserMsg_CustomHudElement_Create'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_MODIFY, um.lookupType('CDOTAUserMsg_CustomHudElement_Modify'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_DESTROY, um.lookupType('CDOTAUserMsg_CustomHudElement_Destroy'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMPENDIUM_STATE, um.lookupType('CDOTAUserMsg_CompendiumState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PROJECTION_ABILITY, um.lookupType('CDOTAUserMsg_ProjectionAbility'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PROJECTION_EVENT, um.lookupType('CDOTAUserMsg_ProjectionEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV, um.lookupType('CMsgDOTACombatLogEntry'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_XP_ALERT, um.lookupType('CDOTAUserMsg_XPAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_QUEST_PROGRESS, um.lookupType('CDOTAUserMsg_UpdateQuestProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUEST_STATUS, um.lookupType('CDOTAUserMsg_QuestStatus'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SUGGEST_HERO_PICK, um.lookupType('CDOTAUserMsg_SuggestHeroPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SUGGEST_HERO_ROLE, um.lookupType('CDOTAUserMsg_SuggestHeroRole'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_KILLCAM_DAMAGE_TAKEN, um.lookupType('CDOTAUserMsg_KillcamDamageTaken'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SELECT_PENALTY_GOLD, um.lookupType('CDOTAUserMsg_SelectPenaltyGold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROLL_DICE_RESULT, um.lookupType('CDOTAUserMsg_RollDiceResult'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FLIP_COIN_RESULT, um.lookupType('CDOTAUserMsg_FlipCoinResult'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_REQUEST_ITEM_SUGGESTIONS, um.lookupType('CDOTAUserMessage_RequestItemSuggestions'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TEAM_CAPTAIN_CHANGED, um.lookupType('CDOTAUserMessage_TeamCaptainChanged'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_ROSHAN_SPECTATOR_PHASE, um.lookupType('CDOTAUserMsg_SendRoshanSpectatorPhase'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_WHEEL_COOLDOWN, um.lookupType('CDOTAUserMsg_ChatWheelCooldown'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DISMISS_ALL_STAT_POPUPS, um.lookupType('CDOTAUserMsg_DismissAllStatPopups'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_DESTROY_PROJECTILE, um.lookupType('CDOTAUserMsg_TE_DestroyProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HERO_RELIC_PROGRESS, um.lookupType('CDOTAUserMsg_HeroRelicProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_DRAFT_REQUEST_ABILITY, um.lookupType('CDOTAUserMsg_AbilityDraftRequestAbility'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_SOLD, um.lookupType('CDOTAUserMsg_ItemSold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DAMAGE_REPORT, um.lookupType('CDOTAUserMsg_DamageReport'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SALUTE_PLAYER, um.lookupType('CDOTAUserMsg_SalutePlayer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TIP_ALERT, um.lookupType('CDOTAUserMsg_TipAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_REPLACE_QUERY_UNIT, um.lookupType('CDOTAUserMsg_ReplaceQueryUnit'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_EMPTY_TELEPORT_ALERT, um.lookupType('CDOTAUserMsg_EmptyTeleportAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MARS_ARENA_OF_BLOOD_ATTACK, um.lookupType('CDOTAUserMsg_MarsArenaOfBloodAttack'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ES_ARCANA_COMBO, um.lookupType('CDOTAUserMsg_ESArcanaCombo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ES_ARCANA_COMBO_SUMMARY, um.lookupType('CDOTAUserMsg_ESArcanaComboSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HIGH_FIVE_LEFT_HANGING, um.lookupType('CDOTAUserMsg_HighFiveLeftHanging'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HIGH_FIVE_COMPLETED, um.lookupType('CDOTAUserMsg_HighFiveCompleted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOVEL_UNEARTH, um.lookupType('CDOTAUserMsg_ShovelUnearth'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_RADAR_ALERT, um.lookupType('CDOTAUserMsg_RadarAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ALL_STAR_EVENT, um.lookupType('CDOTAUserMsg_AllStarEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TALENT_TREE_ALERT, um.lookupType('CDOTAUserMsg_TalentTreeAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUEUED_ORDER_REMOVED, um.lookupType('CDOTAUserMsg_QueuedOrderRemoved'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DEBUG_CHALLENGE, um.lookupType('CDOTAUserMsg_DebugChallenge'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OM_ARCANA_COMBO, um.lookupType('CDOTAUserMsg_OMArcanaCombo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FOUND_NEUTRAL_ITEM, um.lookupType('CDOTAUserMsg_FoundNeutralItem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OUTPOST_CAPTURED, um.lookupType('CDOTAUserMsg_OutpostCaptured'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OUTPOST_GRANTED_XP, um.lookupType('CDOTAUserMsg_OutpostGrantedXP'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MOVE_CAMERA_TO_UNIT, um.lookupType('CDOTAUserMsg_MoveCameraToUnit'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PAUSE_MINIGAME_DATA, um.lookupType('CDOTAUserMsg_PauseMinigameData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VERSUS_SCENE_PLAYER_BEHAVIOR, um.lookupType('CDOTAUserMsg_VersusScene_PlayerBehavior'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QOP_ARCANA_SUMMARY, um.lookupType('CDOTAUserMsg_QoP_ArcanaSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HOT_POTATO_CREATED, um.lookupType('CDOTAUserMsg_HotPotato_Created'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HOT_POTATO_EXPLODED, um.lookupType('CDOTAUserMsg_HotPotato_Exploded'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WK_ARCANA_PROGRESS, um.lookupType('CDOTAUserMsg_WK_Arcana_Progress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GUILD_CHALLENGE_PROGRESS, um.lookupType('CDOTAUserMsg_GuildChallenge_Progress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WR_ARCANA_PROGRESS, um.lookupType('CDOTAUserMsg_WRArcanaProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WR_ARCANA_SUMMARY, um.lookupType('CDOTAUserMsg_WRArcanaSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_EMPTY_ITEM_SLOT_ALERT, um.lookupType('CDOTAUserMsg_EmptyItemSlotAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_AGHS_STATUS_ALERT, um.lookupType('CDOTAUserMsg_AghsStatusAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PING_CONFIRMATION, um.lookupType('CDOTAUserMsg_PingConfirmation'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MUTED_PLAYERS, um.lookupType('CDOTAUserMsg_MutedPlayers'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CONTEXTUAL_TIP, um.lookupType('CDOTAUserMsg_ContextualTip'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_MESSAGE, um.lookupType('CDOTAUserMsg_ChatMessage'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEUTRAL_CAMP_ALERT, um.lookupType('CDOTAUserMsg_NeutralCampAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROCK_PAPER_SCISSORS_STARTED, um.lookupType('CDOTAUserMsg_RockPaperScissorsStarted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROCK_PAPER_SCISSORS_FINISHED, um.lookupType('CDOTAUserMsg_RockPaperScissorsFinished'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_OPPONENT_KILLED, um.lookupType('CDOTAUserMsg_DuelOpponentKilled'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_ACCEPTED, um.lookupType('CDOTAUserMsg_DuelAccepted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_REQUESTED, um.lookupType('CDOTAUserMsg_DuelRequested'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MUERTA_RELEASE_EVENT_ASSIGNED_TARGET_KILLED, um.lookupType('CDOTAUserMsg_MuertaReleaseEvent_AssignedTargetKilled'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PLAYER_DRAFT_SUGGEST_PICK, um.lookupType('CDOTAUserMsg_PlayerDraftSuggestPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PLAYER_DRAFT_PICK, um.lookupType('CDOTAUserMsg_PlayerDraftPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_LINEAR_PROJECTILE_CP_DATA, um.lookupType('CDOTAUserMsg_UpdateLinearProjectileCPData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GIFT_PLAYER, um.lookupType('CDOTAUserMsg_GiftPlayer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FACET_PING, um.lookupType('CDOTAUserMsg_FacetPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_INNATE_PING, um.lookupType('CDOTAUserMsg_InnatePing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROSHAN_TIMER, um.lookupType('CDOTAUserMsg_RoshanTimer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEUTRAL_CRAFT_AVAILABLE, um.lookupType('CDOTAUserMsg_NeutralCraftAvailable'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TIMER_ALERT, um.lookupType('CDOTAUserMsg_TimerAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MADSTONE_ALERT, um.lookupType('CDOTAUserMsg_MadstoneAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COURIER_LEFT_FOUNTAIN_ALERT, um.lookupType('CDOTAUserMsg_CourierLeftFountainAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_INVESTIGATIONS_AVAILABLE, um.lookupType('CDOTAUserMsg_MonsterHunter_InvestigationsAvailable'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_INVESTIGATION_GAME_STATE, um.lookupType('CDOTAUserMsg_MonsterHunter_InvestigationGameState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_HUNT_ALERT, um.lookupType('CDOTAUserMsg_MonsterHunter_HuntAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TORMENTOR_TIMER, um.lookupType('CDOTAUserMsg_TormentorTimer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_KILL_EFFECT, um.lookupType('CDOTAUserMsg_KillEffect'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GIVE_ITEM, um.lookupType('CDOTAUserMsg_GiveItem'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerStringTableTypes(registry) {
        registry.registerStringTableType(StringTableType.MODIFIER_NAMES);
        registry.registerStringTableType(StringTableType.COOLDOWN_NAMES);
        registry.registerStringTableType(StringTableType.ECON_ITEMS);
        registry.registerStringTableType(StringTableType.COMBAT_LOG_NAMES);
        registry.registerStringTableType(StringTableType.LUA_MODIFIERS);
        registry.registerStringTableType(StringTableType.PARTICLE_ASSETS);
    }
}

export default Bootstrap;
