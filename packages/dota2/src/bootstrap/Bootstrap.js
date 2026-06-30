import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Dota 2-specific field rules, user messages, and string table types on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerDotaFieldRules(registry);
        Bootstrap._registerDotaUserMessages(registry);
        Bootstrap._registerDotaStringTableTypes(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDotaFieldRules(registry) {
        registry.registerFieldTypeDecoder('HeroFacetKey_t', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        registry.registerFieldTypeDecoder('HeroID_t', FieldDecoderDescriptor.VAR_INT_32);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDotaUserMessages(registry) {
        const pp = registry.getProtoProvider();

        registry.registerMessageType(MessagePacketType.DOTA_UM_AI_DEBUG_LINE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AIDebugLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ChatEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_HERO_POSITIONS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CombatHeroPositions'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_LOG_BULK_DATA, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CombatLogBulkData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CREATE_LINEAR_PROJECTILE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CreateLinearProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DESTROY_LINEAR_PROJECTILE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DestroyLinearProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DODGE_TRACKING_PROJECTILES, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DodgeTrackingProjectiles'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLOBAL_LIGHT_COLOR, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GlobalLightColor'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLOBAL_LIGHT_DIRECTION, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GlobalLightDirection'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_INVALID_COMMAND, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_InvalidCommand'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_LOCATION_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_LocationPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MAP_LINE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MapLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINI_KILL_CAM_INFO, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MiniKillCamInfo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINIMAP_DEBUG_POINT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MinimapDebugPoint'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINIMAP_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MinimapEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEVERMORE_REQUIEM, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_NevermoreRequiem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OVERHEAD_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_OverheadEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SET_NEXT_AUTOBUY_ITEM, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SetNextAutobuyItem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHARED_COOLDOWN, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SharedCooldown'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_CLICK, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SpectatorPlayerClick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_TIP_INFO, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialTipInfo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UNIT_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_UnitEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BOT_CHAT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_BotChat'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HUD_ERROR, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HudError'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_PURCHASED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ItemPurchased'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_Ping'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_FOUND, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ItemFound'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SWAP_VERIFY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SwapVerify'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WORLD_LINE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_WorldLine'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ItemAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HALLOWEEN_DROPS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HalloweenDrops'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_WHEEL, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ChatWheel'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_RECEIVED_XMAS_GIFT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ReceivedXmasGift'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_SHARED_CONTENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_UpdateSharedContent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_REQUEST_EXP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialRequestExp'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_PING_MINIMAP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialPingMinimap'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GAMERULES_STATE_CHANGED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GamerulesStateChanged'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOW_SURVEY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ShowSurvey'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_FADE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialFade'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ADD_QUEST_LOG_ENTRY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AddQuestLogEntry'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_STAT_POPUP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SendStatPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_FINISH, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialFinish'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_ROSHAN_POPUP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SendRoshanPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_GENERIC_TOOL_TIP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SendGenericToolTip'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_FINAL_GOLD, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SendFinalGold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_MSG, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CustomMsg'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COACH_HUD_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CoachHUDPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CLIENT_LOAD_GRID_NAV, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ClientLoadGridNav'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_PROJECTILE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_Projectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_PROJECTILE_LOC, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_ProjectileLoc'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_DOTA_BLOOD_IMPACT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_DotaBloodImpact'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_UNIT_ANIMATION, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_UnitAnimation'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_UNIT_ANIMATION_END, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_UnitAnimationEnd'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AbilityPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOW_GENERIC_POPUP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ShowGenericPopup'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_START, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_VoteStart'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_UPDATE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_VoteUpdate'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VOTE_END, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_VoteEnd'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BOOSTER_STATE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_BoosterState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WILL_PURCHASE_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_WillPurchaseAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TUTORIAL_MINIMAP_POSITION, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TutorialMinimapPosition'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_STEAL, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AbilitySteal'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COURIER_KILLED_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CourierKilledAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ENEMY_ITEM_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_EnemyItemAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_STATS_MATCH_DETAILS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_StatsMatchDetails'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MINI_TAUNT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MiniTaunt'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BUY_BACK_STATE_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_BuyBackStateAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPEECH_BUBBLE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SpeechBubble'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HEADER_MESSAGE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CustomHeaderMessage'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUICK_BUY_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_QuickBuyAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MODIFIER_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ModifierAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HP_MANA_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HPManaAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GLYPH_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GlyphAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_BEAST_CHAT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_BeastChat'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SpectatorPlayerUnitOrders'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_CREATE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CustomHudElement_Create'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_MODIFY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CustomHudElement_Modify'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CUSTOM_HUD_ELEMENT_DESTROY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CustomHudElement_Destroy'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMPENDIUM_STATE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CompendiumState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PROJECTION_ABILITY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ProjectionAbility'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PROJECTION_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ProjectionEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV, pp.DOTA_USER_MESSAGES.lookupType('CMsgDOTACombatLogEntry'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_XP_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_XPAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_QUEST_PROGRESS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_UpdateQuestProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUEST_STATUS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_QuestStatus'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SUGGEST_HERO_PICK, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SuggestHeroPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SUGGEST_HERO_ROLE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SuggestHeroRole'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_KILLCAM_DAMAGE_TAKEN, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_KillcamDamageTaken'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SELECT_PENALTY_GOLD, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SelectPenaltyGold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROLL_DICE_RESULT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_RollDiceResult'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FLIP_COIN_RESULT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_FlipCoinResult'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_REQUEST_ITEM_SUGGESTIONS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMessage_RequestItemSuggestions'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TEAM_CAPTAIN_CHANGED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMessage_TeamCaptainChanged'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SEND_ROSHAN_SPECTATOR_PHASE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SendRoshanSpectatorPhase'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_WHEEL_COOLDOWN, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ChatWheelCooldown'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DISMISS_ALL_STAT_POPUPS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DismissAllStatPopups'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TE_DESTROY_PROJECTILE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TE_DestroyProjectile'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HERO_RELIC_PROGRESS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HeroRelicProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ABILITY_DRAFT_REQUEST_ABILITY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AbilityDraftRequestAbility'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ITEM_SOLD, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ItemSold'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DAMAGE_REPORT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DamageReport'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SALUTE_PLAYER, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_SalutePlayer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TIP_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TipAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_REPLACE_QUERY_UNIT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ReplaceQueryUnit'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_EMPTY_TELEPORT_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_EmptyTeleportAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MARS_ARENA_OF_BLOOD_ATTACK, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MarsArenaOfBloodAttack'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ES_ARCANA_COMBO, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ESArcanaCombo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ES_ARCANA_COMBO_SUMMARY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ESArcanaComboSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HIGH_FIVE_LEFT_HANGING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HighFiveLeftHanging'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HIGH_FIVE_COMPLETED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HighFiveCompleted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_SHOVEL_UNEARTH, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ShovelUnearth'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_RADAR_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_RadarAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ALL_STAR_EVENT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AllStarEvent'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TALENT_TREE_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TalentTreeAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QUEUED_ORDER_REMOVED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_QueuedOrderRemoved'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DEBUG_CHALLENGE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DebugChallenge'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OM_ARCANA_COMBO, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_OMArcanaCombo'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FOUND_NEUTRAL_ITEM, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_FoundNeutralItem'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OUTPOST_CAPTURED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_OutpostCaptured'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_OUTPOST_GRANTED_XP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_OutpostGrantedXP'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MOVE_CAMERA_TO_UNIT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MoveCameraToUnit'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PAUSE_MINIGAME_DATA, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_PauseMinigameData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_VERSUS_SCENE_PLAYER_BEHAVIOR, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_VersusScene_PlayerBehavior'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_QOP_ARCANA_SUMMARY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_QoP_ArcanaSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HOT_POTATO_CREATED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HotPotato_Created'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_HOT_POTATO_EXPLODED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_HotPotato_Exploded'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WK_ARCANA_PROGRESS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_WK_Arcana_Progress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GUILD_CHALLENGE_PROGRESS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GuildChallenge_Progress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WR_ARCANA_PROGRESS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_WRArcanaProgress'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_WR_ARCANA_SUMMARY, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_WRArcanaSummary'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_EMPTY_ITEM_SLOT_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_EmptyItemSlotAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_AGHS_STATUS_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_AghsStatusAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PING_CONFIRMATION, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_PingConfirmation'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MUTED_PLAYERS, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MutedPlayers'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CONTEXTUAL_TIP, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ContextualTip'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_CHAT_MESSAGE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_ChatMessage'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEUTRAL_CAMP_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_NeutralCampAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROCK_PAPER_SCISSORS_STARTED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_RockPaperScissorsStarted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROCK_PAPER_SCISSORS_FINISHED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_RockPaperScissorsFinished'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_OPPONENT_KILLED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DuelOpponentKilled'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_ACCEPTED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DuelAccepted'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_DUEL_REQUESTED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_DuelRequested'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MUERTA_RELEASE_EVENT_ASSIGNED_TARGET_KILLED, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MuertaReleaseEvent_AssignedTargetKilled'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PLAYER_DRAFT_SUGGEST_PICK, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_PlayerDraftSuggestPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_PLAYER_DRAFT_PICK, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_PlayerDraftPick'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_UPDATE_LINEAR_PROJECTILE_CP_DATA, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_UpdateLinearProjectileCPData'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GIFT_PLAYER, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GiftPlayer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_FACET_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_FacetPing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_INNATE_PING, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_InnatePing'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_ROSHAN_TIMER, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_RoshanTimer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_NEUTRAL_CRAFT_AVAILABLE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_NeutralCraftAvailable'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TIMER_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TimerAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MADSTONE_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MadstoneAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_COURIER_LEFT_FOUNTAIN_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_CourierLeftFountainAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_INVESTIGATIONS_AVAILABLE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MonsterHunter_InvestigationsAvailable'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_INVESTIGATION_GAME_STATE, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MonsterHunter_InvestigationGameState'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_MONSTER_HUNTER_HUNT_ALERT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_MonsterHunter_HuntAlert'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_TORMENTOR_TIMER, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_TormentorTimer'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_KILL_EFFECT, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_KillEffect'));
        registry.registerMessageType(MessagePacketType.DOTA_UM_GIVE_ITEM, pp.DOTA_USER_MESSAGES.lookupType('CDOTAUserMsg_GiveItem'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDotaStringTableTypes(registry) {
        const pp = registry.getProtoProvider();

        const modifierProto = pp.DOTA_MODIFIERS.lookupType('CDOTAModifierBuffTableEntry');

        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS, buffer => modifierProto.decode(buffer));
        registry.registerStringTableType(StringTableType.MODIFIER_NAMES);
        registry.registerStringTableType(StringTableType.COOLDOWN_NAMES);
        registry.registerStringTableType(StringTableType.ECON_ITEMS);
        registry.registerStringTableType(StringTableType.COMBAT_LOG_NAMES);
        registry.registerStringTableType(StringTableType.LUA_MODIFIERS);
        registry.registerStringTableType(StringTableType.PARTICLE_ASSETS);
        registry.registerStringTableType(StringTableType.DOWNLOADABLES);
    }
}

export default Bootstrap;
