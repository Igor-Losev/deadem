import EngineMessagePacketType from '@deadem/engine/src/data/enums/MessagePacketType.js';

class MessagePacketType extends EngineMessagePacketType {
    static get DOTA_UM_AI_DEBUG_LINE() { return dotaUmAiDebugLine; }
    static get DOTA_UM_CHAT_EVENT() { return dotaUmChatEvent; }
    static get DOTA_UM_COMBAT_HERO_POSITIONS() { return dotaUmCombatHeroPositions; }
    static get DOTA_UM_COMBAT_LOG_BULK_DATA() { return dotaUmCombatLogBulkData; }
    static get DOTA_UM_CREATE_LINEAR_PROJECTILE() { return dotaUmCreateLinearProjectile; }
    static get DOTA_UM_DESTROY_LINEAR_PROJECTILE() { return dotaUmDestroyLinearProjectile; }
    static get DOTA_UM_DODGE_TRACKING_PROJECTILES() { return dotaUmDodgeTrackingProjectiles; }
    static get DOTA_UM_GLOBAL_LIGHT_COLOR() { return dotaUmGlobalLightColor; }
    static get DOTA_UM_GLOBAL_LIGHT_DIRECTION() { return dotaUmGlobalLightDirection; }
    static get DOTA_UM_INVALID_COMMAND() { return dotaUmInvalidCommand; }
    static get DOTA_UM_LOCATION_PING() { return dotaUmLocationPing; }
    static get DOTA_UM_MAP_LINE() { return dotaUmMapLine; }
    static get DOTA_UM_MINI_KILL_CAM_INFO() { return dotaUmMiniKillCamInfo; }
    static get DOTA_UM_MINIMAP_DEBUG_POINT() { return dotaUmMinimapDebugPoint; }
    static get DOTA_UM_MINIMAP_EVENT() { return dotaUmMinimapEvent; }
    static get DOTA_UM_NEVERMORE_REQUIEM() { return dotaUmNevermoreRequiem; }
    static get DOTA_UM_OVERHEAD_EVENT() { return dotaUmOverheadEvent; }
    static get DOTA_UM_SET_NEXT_AUTOBUY_ITEM() { return dotaUmSetNextAutobuyItem; }
    static get DOTA_UM_SHARED_COOLDOWN() { return dotaUmSharedCooldown; }
    static get DOTA_UM_SPECTATOR_PLAYER_CLICK() { return dotaUmSpectatorPlayerClick; }
    static get DOTA_UM_TUTORIAL_TIP_INFO() { return dotaUmTutorialTipInfo; }
    static get DOTA_UM_UNIT_EVENT() { return dotaUmUnitEvent; }
    static get DOTA_UM_BOT_CHAT() { return dotaUmBotChat; }
    static get DOTA_UM_HUD_ERROR() { return dotaUmHudError; }
    static get DOTA_UM_ITEM_PURCHASED() { return dotaUmItemPurchased; }
    static get DOTA_UM_PING() { return dotaUmPing; }
    static get DOTA_UM_ITEM_FOUND() { return dotaUmItemFound; }
    static get DOTA_UM_SWAP_VERIFY() { return dotaUmSwapVerify; }
    static get DOTA_UM_WORLD_LINE() { return dotaUmWorldLine; }
    static get DOTA_UM_ITEM_ALERT() { return dotaUmItemAlert; }
    static get DOTA_UM_HALLOWEEN_DROPS() { return dotaUmHalloweenDrops; }
    static get DOTA_UM_CHAT_WHEEL() { return dotaUmChatWheel; }
    static get DOTA_UM_RECEIVED_XMAS_GIFT() { return dotaUmReceivedXmasGift; }
    static get DOTA_UM_UPDATE_SHARED_CONTENT() { return dotaUmUpdateSharedContent; }
    static get DOTA_UM_TUTORIAL_REQUEST_EXP() { return dotaUmTutorialRequestExp; }
    static get DOTA_UM_TUTORIAL_PING_MINIMAP() { return dotaUmTutorialPingMinimap; }
    static get DOTA_UM_GAMERULES_STATE_CHANGED() { return dotaUmGamerulesStateChanged; }
    static get DOTA_UM_SHOW_SURVEY() { return dotaUmShowSurvey; }
    static get DOTA_UM_TUTORIAL_FADE() { return dotaUmTutorialFade; }
    static get DOTA_UM_ADD_QUEST_LOG_ENTRY() { return dotaUmAddQuestLogEntry; }
    static get DOTA_UM_SEND_STAT_POPUP() { return dotaUmSendStatPopup; }
    static get DOTA_UM_TUTORIAL_FINISH() { return dotaUmTutorialFinish; }
    static get DOTA_UM_SEND_ROSHAN_POPUP() { return dotaUmSendRoshanPopup; }
    static get DOTA_UM_SEND_GENERIC_TOOL_TIP() { return dotaUmSendGenericToolTip; }
    static get DOTA_UM_SEND_FINAL_GOLD() { return dotaUmSendFinalGold; }
    static get DOTA_UM_CUSTOM_MSG() { return dotaUmCustomMsg; }
    static get DOTA_UM_COACH_HUD_PING() { return dotaUmCoachHudPing; }
    static get DOTA_UM_CLIENT_LOAD_GRID_NAV() { return dotaUmClientLoadGridNav; }
    static get DOTA_UM_TE_PROJECTILE() { return dotaUmTeProjectile; }
    static get DOTA_UM_TE_PROJECTILE_LOC() { return dotaUmTeProjectileLoc; }
    static get DOTA_UM_TE_DOTA_BLOOD_IMPACT() { return dotaUmTeDotaBloodImpact; }
    static get DOTA_UM_TE_UNIT_ANIMATION() { return dotaUmTeUnitAnimation; }
    static get DOTA_UM_TE_UNIT_ANIMATION_END() { return dotaUmTeUnitAnimationEnd; }
    static get DOTA_UM_ABILITY_PING() { return dotaUmAbilityPing; }
    static get DOTA_UM_SHOW_GENERIC_POPUP() { return dotaUmShowGenericPopup; }
    static get DOTA_UM_VOTE_START() { return dotaUmVoteStart; }
    static get DOTA_UM_VOTE_UPDATE() { return dotaUmVoteUpdate; }
    static get DOTA_UM_VOTE_END() { return dotaUmVoteEnd; }
    static get DOTA_UM_BOOSTER_STATE() { return dotaUmBoosterState; }
    static get DOTA_UM_WILL_PURCHASE_ALERT() { return dotaUmWillPurchaseAlert; }
    static get DOTA_UM_TUTORIAL_MINIMAP_POSITION() { return dotaUmTutorialMinimapPosition; }
    static get DOTA_UM_ABILITY_STEAL() { return dotaUmAbilitySteal; }
    static get DOTA_UM_COURIER_KILLED_ALERT() { return dotaUmCourierKilledAlert; }
    static get DOTA_UM_ENEMY_ITEM_ALERT() { return dotaUmEnemyItemAlert; }
    static get DOTA_UM_STATS_MATCH_DETAILS() { return dotaUmStatsMatchDetails; }
    static get DOTA_UM_MINI_TAUNT() { return dotaUmMiniTaunt; }
    static get DOTA_UM_BUY_BACK_STATE_ALERT() { return dotaUmBuyBackStateAlert; }
    static get DOTA_UM_SPEECH_BUBBLE() { return dotaUmSpeechBubble; }
    static get DOTA_UM_CUSTOM_HEADER_MESSAGE() { return dotaUmCustomHeaderMessage; }
    static get DOTA_UM_QUICK_BUY_ALERT() { return dotaUmQuickBuyAlert; }
    static get DOTA_UM_MODIFIER_ALERT() { return dotaUmModifierAlert; }
    static get DOTA_UM_HP_MANA_ALERT() { return dotaUmHpManaAlert; }
    static get DOTA_UM_GLYPH_ALERT() { return dotaUmGlyphAlert; }
    static get DOTA_UM_BEAST_CHAT() { return dotaUmBeastChat; }
    static get DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS() { return dotaUmSpectatorPlayerUnitOrders; }
    static get DOTA_UM_CUSTOM_HUD_ELEMENT_CREATE() { return dotaUmCustomHudElementCreate; }
    static get DOTA_UM_CUSTOM_HUD_ELEMENT_MODIFY() { return dotaUmCustomHudElementModify; }
    static get DOTA_UM_CUSTOM_HUD_ELEMENT_DESTROY() { return dotaUmCustomHudElementDestroy; }
    static get DOTA_UM_COMPENDIUM_STATE() { return dotaUmCompendiumState; }
    static get DOTA_UM_PROJECTION_ABILITY() { return dotaUmProjectionAbility; }
    static get DOTA_UM_PROJECTION_EVENT() { return dotaUmProjectionEvent; }
    static get DOTA_UM_COMBAT_LOG_DATA_HLTV() { return dotaUmCombatLogDataHltv; }
    static get DOTA_UM_XP_ALERT() { return dotaUmXpAlert; }
    static get DOTA_UM_UPDATE_QUEST_PROGRESS() { return dotaUmUpdateQuestProgress; }
    static get DOTA_UM_QUEST_STATUS() { return dotaUmQuestStatus; }
    static get DOTA_UM_SUGGEST_HERO_PICK() { return dotaUmSuggestHeroPick; }
    static get DOTA_UM_SUGGEST_HERO_ROLE() { return dotaUmSuggestHeroRole; }
    static get DOTA_UM_KILLCAM_DAMAGE_TAKEN() { return dotaUmKillcamDamageTaken; }
    static get DOTA_UM_SELECT_PENALTY_GOLD() { return dotaUmSelectPenaltyGold; }
    static get DOTA_UM_ROLL_DICE_RESULT() { return dotaUmRollDiceResult; }
    static get DOTA_UM_FLIP_COIN_RESULT() { return dotaUmFlipCoinResult; }
    static get DOTA_UM_REQUEST_ITEM_SUGGESTIONS() { return dotaUmRequestItemSuggestions; }
    static get DOTA_UM_TEAM_CAPTAIN_CHANGED() { return dotaUmTeamCaptainChanged; }
    static get DOTA_UM_SEND_ROSHAN_SPECTATOR_PHASE() { return dotaUmSendRoshanSpectatorPhase; }
    static get DOTA_UM_CHAT_WHEEL_COOLDOWN() { return dotaUmChatWheelCooldown; }
    static get DOTA_UM_DISMISS_ALL_STAT_POPUPS() { return dotaUmDismissAllStatPopups; }
    static get DOTA_UM_TE_DESTROY_PROJECTILE() { return dotaUmTeDestroyProjectile; }
    static get DOTA_UM_HERO_RELIC_PROGRESS() { return dotaUmHeroRelicProgress; }
    static get DOTA_UM_ABILITY_DRAFT_REQUEST_ABILITY() { return dotaUmAbilityDraftRequestAbility; }
    static get DOTA_UM_ITEM_SOLD() { return dotaUmItemSold; }
    static get DOTA_UM_DAMAGE_REPORT() { return dotaUmDamageReport; }
    static get DOTA_UM_SALUTE_PLAYER() { return dotaUmSalutePlayer; }
    static get DOTA_UM_TIP_ALERT() { return dotaUmTipAlert; }
    static get DOTA_UM_REPLACE_QUERY_UNIT() { return dotaUmReplaceQueryUnit; }
    static get DOTA_UM_EMPTY_TELEPORT_ALERT() { return dotaUmEmptyTeleportAlert; }
    static get DOTA_UM_MARS_ARENA_OF_BLOOD_ATTACK() { return dotaUmMarsArenaOfBloodAttack; }
    static get DOTA_UM_ES_ARCANA_COMBO() { return dotaUmEsArcanaCombo; }
    static get DOTA_UM_ES_ARCANA_COMBO_SUMMARY() { return dotaUmEsArcanaComboSummary; }
    static get DOTA_UM_HIGH_FIVE_LEFT_HANGING() { return dotaUmHighFiveLeftHanging; }
    static get DOTA_UM_HIGH_FIVE_COMPLETED() { return dotaUmHighFiveCompleted; }
    static get DOTA_UM_SHOVEL_UNEARTH() { return dotaUmShovelUnearth; }
    static get DOTA_UM_RADAR_ALERT() { return dotaUmRadarAlert; }
    static get DOTA_UM_ALL_STAR_EVENT() { return dotaUmAllStarEvent; }
    static get DOTA_UM_TALENT_TREE_ALERT() { return dotaUmTalentTreeAlert; }
    static get DOTA_UM_QUEUED_ORDER_REMOVED() { return dotaUmQueuedOrderRemoved; }
    static get DOTA_UM_DEBUG_CHALLENGE() { return dotaUmDebugChallenge; }
    static get DOTA_UM_OM_ARCANA_COMBO() { return dotaUmOmArcanaCombo; }
    static get DOTA_UM_FOUND_NEUTRAL_ITEM() { return dotaUmFoundNeutralItem; }
    static get DOTA_UM_OUTPOST_CAPTURED() { return dotaUmOutpostCaptured; }
    static get DOTA_UM_OUTPOST_GRANTED_XP() { return dotaUmOutpostGrantedXp; }
    static get DOTA_UM_MOVE_CAMERA_TO_UNIT() { return dotaUmMoveCameraToUnit; }
    static get DOTA_UM_PAUSE_MINIGAME_DATA() { return dotaUmPauseMinigameData; }
    static get DOTA_UM_VERSUS_SCENE_PLAYER_BEHAVIOR() { return dotaUmVersusScenePlayerBehavior; }
    static get DOTA_UM_QOP_ARCANA_SUMMARY() { return dotaUmQopArcanaSummary; }
    static get DOTA_UM_HOT_POTATO_CREATED() { return dotaUmHotPotatoCreated; }
    static get DOTA_UM_HOT_POTATO_EXPLODED() { return dotaUmHotPotatoExploded; }
    static get DOTA_UM_WK_ARCANA_PROGRESS() { return dotaUmWkArcanaProgress; }
    static get DOTA_UM_GUILD_CHALLENGE_PROGRESS() { return dotaUmGuildChallengeProgress; }
    static get DOTA_UM_WR_ARCANA_PROGRESS() { return dotaUmWrArcanaProgress; }
    static get DOTA_UM_WR_ARCANA_SUMMARY() { return dotaUmWrArcanaSummary; }
    static get DOTA_UM_EMPTY_ITEM_SLOT_ALERT() { return dotaUmEmptyItemSlotAlert; }
    static get DOTA_UM_AGHS_STATUS_ALERT() { return dotaUmAghsStatusAlert; }
    static get DOTA_UM_PING_CONFIRMATION() { return dotaUmPingConfirmation; }
    static get DOTA_UM_MUTED_PLAYERS() { return dotaUmMutedPlayers; }
    static get DOTA_UM_CONTEXTUAL_TIP() { return dotaUmContextualTip; }
    static get DOTA_UM_CHAT_MESSAGE() { return dotaUmChatMessage; }
    static get DOTA_UM_NEUTRAL_CAMP_ALERT() { return dotaUmNeutralCampAlert; }
    static get DOTA_UM_ROCK_PAPER_SCISSORS_STARTED() { return dotaUmRockPaperScissorsStarted; }
    static get DOTA_UM_ROCK_PAPER_SCISSORS_FINISHED() { return dotaUmRockPaperScissorsFinished; }
    static get DOTA_UM_DUEL_OPPONENT_KILLED() { return dotaUmDuelOpponentKilled; }
    static get DOTA_UM_DUEL_ACCEPTED() { return dotaUmDuelAccepted; }
    static get DOTA_UM_DUEL_REQUESTED() { return dotaUmDuelRequested; }
    static get DOTA_UM_MUERTA_RELEASE_EVENT_ASSIGNED_TARGET_KILLED() { return dotaUmMuertaReleaseEventAssignedTargetKilled; }
    static get DOTA_UM_PLAYER_DRAFT_SUGGEST_PICK() { return dotaUmPlayerDraftSuggestPick; }
    static get DOTA_UM_PLAYER_DRAFT_PICK() { return dotaUmPlayerDraftPick; }
    static get DOTA_UM_UPDATE_LINEAR_PROJECTILE_CP_DATA() { return dotaUmUpdateLinearProjectileCpData; }
    static get DOTA_UM_GIFT_PLAYER() { return dotaUmGiftPlayer; }
    static get DOTA_UM_FACET_PING() { return dotaUmFacetPing; }
    static get DOTA_UM_INNATE_PING() { return dotaUmInnatePing; }
    static get DOTA_UM_ROSHAN_TIMER() { return dotaUmRoshanTimer; }
    static get DOTA_UM_NEUTRAL_CRAFT_AVAILABLE() { return dotaUmNeutralCraftAvailable; }
    static get DOTA_UM_TIMER_ALERT() { return dotaUmTimerAlert; }
    static get DOTA_UM_MADSTONE_ALERT() { return dotaUmMadstoneAlert; }
    static get DOTA_UM_COURIER_LEFT_FOUNTAIN_ALERT() { return dotaUmCourierLeftFountainAlert; }
    static get DOTA_UM_MONSTER_HUNTER_INVESTIGATIONS_AVAILABLE() { return dotaUmMonsterHunterInvestigationsAvailable; }
    static get DOTA_UM_MONSTER_HUNTER_INVESTIGATION_GAME_STATE() { return dotaUmMonsterHunterInvestigationGameState; }
    static get DOTA_UM_MONSTER_HUNTER_HUNT_ALERT() { return dotaUmMonsterHunterHuntAlert; }
    static get DOTA_UM_TORMENTOR_TIMER() { return dotaUmTormentorTimer; }
    static get DOTA_UM_KILL_EFFECT() { return dotaUmKillEffect; }
    static get DOTA_UM_GIVE_ITEM() { return dotaUmGiveItem; }
}

const dotaUmAiDebugLine = new MessagePacketType('DOTA_UM_AIDebugLine', 465);
const dotaUmChatEvent = new MessagePacketType('DOTA_UM_ChatEvent', 466);
const dotaUmCombatHeroPositions = new MessagePacketType('DOTA_UM_CombatHeroPositions', 467);
const dotaUmCombatLogBulkData = new MessagePacketType('DOTA_UM_CombatLogBulkData', 470);
const dotaUmCreateLinearProjectile = new MessagePacketType('DOTA_UM_CreateLinearProjectile', 471);
const dotaUmDestroyLinearProjectile = new MessagePacketType('DOTA_UM_DestroyLinearProjectile', 472);
const dotaUmDodgeTrackingProjectiles = new MessagePacketType('DOTA_UM_DodgeTrackingProjectiles', 473);
const dotaUmGlobalLightColor = new MessagePacketType('DOTA_UM_GlobalLightColor', 474);
const dotaUmGlobalLightDirection = new MessagePacketType('DOTA_UM_GlobalLightDirection', 475);
const dotaUmInvalidCommand = new MessagePacketType('DOTA_UM_InvalidCommand', 476);
const dotaUmLocationPing = new MessagePacketType('DOTA_UM_LocationPing', 477);
const dotaUmMapLine = new MessagePacketType('DOTA_UM_MapLine', 478);
const dotaUmMiniKillCamInfo = new MessagePacketType('DOTA_UM_MiniKillCamInfo', 479);
const dotaUmMinimapDebugPoint = new MessagePacketType('DOTA_UM_MinimapDebugPoint', 480);
const dotaUmMinimapEvent = new MessagePacketType('DOTA_UM_MinimapEvent', 481);
const dotaUmNevermoreRequiem = new MessagePacketType('DOTA_UM_NevermoreRequiem', 482);
const dotaUmOverheadEvent = new MessagePacketType('DOTA_UM_OverheadEvent', 483);
const dotaUmSetNextAutobuyItem = new MessagePacketType('DOTA_UM_SetNextAutobuyItem', 484);
const dotaUmSharedCooldown = new MessagePacketType('DOTA_UM_SharedCooldown', 485);
const dotaUmSpectatorPlayerClick = new MessagePacketType('DOTA_UM_SpectatorPlayerClick', 486);
const dotaUmTutorialTipInfo = new MessagePacketType('DOTA_UM_TutorialTipInfo', 487);
const dotaUmUnitEvent = new MessagePacketType('DOTA_UM_UnitEvent', 488);
const dotaUmBotChat = new MessagePacketType('DOTA_UM_BotChat', 490);
const dotaUmHudError = new MessagePacketType('DOTA_UM_HudError', 491);
const dotaUmItemPurchased = new MessagePacketType('DOTA_UM_ItemPurchased', 492);
const dotaUmPing = new MessagePacketType('DOTA_UM_Ping', 493);
const dotaUmItemFound = new MessagePacketType('DOTA_UM_ItemFound', 494);
const dotaUmSwapVerify = new MessagePacketType('DOTA_UM_SwapVerify', 496);
const dotaUmWorldLine = new MessagePacketType('DOTA_UM_WorldLine', 497);
const dotaUmItemAlert = new MessagePacketType('DOTA_UM_ItemAlert', 499);
const dotaUmHalloweenDrops = new MessagePacketType('DOTA_UM_HalloweenDrops', 500);
const dotaUmChatWheel = new MessagePacketType('DOTA_UM_ChatWheel', 501);
const dotaUmReceivedXmasGift = new MessagePacketType('DOTA_UM_ReceivedXmasGift', 502);
const dotaUmUpdateSharedContent = new MessagePacketType('DOTA_UM_UpdateSharedContent', 503);
const dotaUmTutorialRequestExp = new MessagePacketType('DOTA_UM_TutorialRequestExp', 504);
const dotaUmTutorialPingMinimap = new MessagePacketType('DOTA_UM_TutorialPingMinimap', 505);
const dotaUmGamerulesStateChanged = new MessagePacketType('DOTA_UM_GamerulesStateChanged', 506);
const dotaUmShowSurvey = new MessagePacketType('DOTA_UM_ShowSurvey', 507);
const dotaUmTutorialFade = new MessagePacketType('DOTA_UM_TutorialFade', 508);
const dotaUmAddQuestLogEntry = new MessagePacketType('DOTA_UM_AddQuestLogEntry', 509);
const dotaUmSendStatPopup = new MessagePacketType('DOTA_UM_SendStatPopup', 510);
const dotaUmTutorialFinish = new MessagePacketType('DOTA_UM_TutorialFinish', 511);
const dotaUmSendRoshanPopup = new MessagePacketType('DOTA_UM_SendRoshanPopup', 512);
const dotaUmSendGenericToolTip = new MessagePacketType('DOTA_UM_SendGenericToolTip', 513);
const dotaUmSendFinalGold = new MessagePacketType('DOTA_UM_SendFinalGold', 514);
const dotaUmCustomMsg = new MessagePacketType('DOTA_UM_CustomMsg', 515);
const dotaUmCoachHudPing = new MessagePacketType('DOTA_UM_CoachHUDPing', 516);
const dotaUmClientLoadGridNav = new MessagePacketType('DOTA_UM_ClientLoadGridNav', 517);
const dotaUmTeProjectile = new MessagePacketType('DOTA_UM_TE_Projectile', 518);
const dotaUmTeProjectileLoc = new MessagePacketType('DOTA_UM_TE_ProjectileLoc', 519);
const dotaUmTeDotaBloodImpact = new MessagePacketType('DOTA_UM_TE_DotaBloodImpact', 520);
const dotaUmTeUnitAnimation = new MessagePacketType('DOTA_UM_TE_UnitAnimation', 521);
const dotaUmTeUnitAnimationEnd = new MessagePacketType('DOTA_UM_TE_UnitAnimationEnd', 522);
const dotaUmAbilityPing = new MessagePacketType('DOTA_UM_AbilityPing', 523);
const dotaUmShowGenericPopup = new MessagePacketType('DOTA_UM_ShowGenericPopup', 524);
const dotaUmVoteStart = new MessagePacketType('DOTA_UM_VoteStart', 525);
const dotaUmVoteUpdate = new MessagePacketType('DOTA_UM_VoteUpdate', 526);
const dotaUmVoteEnd = new MessagePacketType('DOTA_UM_VoteEnd', 527);
const dotaUmBoosterState = new MessagePacketType('DOTA_UM_BoosterState', 528);
const dotaUmWillPurchaseAlert = new MessagePacketType('DOTA_UM_WillPurchaseAlert', 529);
const dotaUmTutorialMinimapPosition = new MessagePacketType('DOTA_UM_TutorialMinimapPosition', 530);
const dotaUmAbilitySteal = new MessagePacketType('DOTA_UM_AbilitySteal', 532);
const dotaUmCourierKilledAlert = new MessagePacketType('DOTA_UM_CourierKilledAlert', 533);
const dotaUmEnemyItemAlert = new MessagePacketType('DOTA_UM_EnemyItemAlert', 534);
const dotaUmStatsMatchDetails = new MessagePacketType('DOTA_UM_StatsMatchDetails', 535);
const dotaUmMiniTaunt = new MessagePacketType('DOTA_UM_MiniTaunt', 536);
const dotaUmBuyBackStateAlert = new MessagePacketType('DOTA_UM_BuyBackStateAlert', 537);
const dotaUmSpeechBubble = new MessagePacketType('DOTA_UM_SpeechBubble', 538);
const dotaUmCustomHeaderMessage = new MessagePacketType('DOTA_UM_CustomHeaderMessage', 539);
const dotaUmQuickBuyAlert = new MessagePacketType('DOTA_UM_QuickBuyAlert', 540);
const dotaUmModifierAlert = new MessagePacketType('DOTA_UM_ModifierAlert', 543);
const dotaUmHpManaAlert = new MessagePacketType('DOTA_UM_HPManaAlert', 544);
const dotaUmGlyphAlert = new MessagePacketType('DOTA_UM_GlyphAlert', 545);
const dotaUmBeastChat = new MessagePacketType('DOTA_UM_BeastChat', 546);
const dotaUmSpectatorPlayerUnitOrders = new MessagePacketType('DOTA_UM_SpectatorPlayerUnitOrders', 547);
const dotaUmCustomHudElementCreate = new MessagePacketType('DOTA_UM_CustomHudElement_Create', 548);
const dotaUmCustomHudElementModify = new MessagePacketType('DOTA_UM_CustomHudElement_Modify', 549);
const dotaUmCustomHudElementDestroy = new MessagePacketType('DOTA_UM_CustomHudElement_Destroy', 550);
const dotaUmCompendiumState = new MessagePacketType('DOTA_UM_CompendiumState', 551);
const dotaUmProjectionAbility = new MessagePacketType('DOTA_UM_ProjectionAbility', 552);
const dotaUmProjectionEvent = new MessagePacketType('DOTA_UM_ProjectionEvent', 553);
const dotaUmCombatLogDataHltv = new MessagePacketType('DOTA_UM_CombatLogDataHltv', 554);
const dotaUmXpAlert = new MessagePacketType('DOTA_UM_XPAlert', 555);
const dotaUmUpdateQuestProgress = new MessagePacketType('DOTA_UM_UpdateQuestProgress', 556);
const dotaUmQuestStatus = new MessagePacketType('DOTA_UM_QuestStatus', 559);
const dotaUmSuggestHeroPick = new MessagePacketType('DOTA_UM_SuggestHeroPick', 560);
const dotaUmSuggestHeroRole = new MessagePacketType('DOTA_UM_SuggestHeroRole', 561);
const dotaUmKillcamDamageTaken = new MessagePacketType('DOTA_UM_KillcamDamageTaken', 562);
const dotaUmSelectPenaltyGold = new MessagePacketType('DOTA_UM_SelectPenaltyGold', 563);
const dotaUmRollDiceResult = new MessagePacketType('DOTA_UM_RollDiceResult', 564);
const dotaUmFlipCoinResult = new MessagePacketType('DOTA_UM_FlipCoinResult', 565);
const dotaUmRequestItemSuggestions = new MessagePacketType('DOTA_UM_RequestItemSuggestions', 566);
const dotaUmTeamCaptainChanged = new MessagePacketType('DOTA_UM_TeamCaptainChanged', 567);
const dotaUmSendRoshanSpectatorPhase = new MessagePacketType('DOTA_UM_SendRoshanSpectatorPhase', 568);
const dotaUmChatWheelCooldown = new MessagePacketType('DOTA_UM_ChatWheelCooldown', 569);
const dotaUmDismissAllStatPopups = new MessagePacketType('DOTA_UM_DismissAllStatPopups', 570);
const dotaUmTeDestroyProjectile = new MessagePacketType('DOTA_UM_TE_DestroyProjectile', 571);
const dotaUmHeroRelicProgress = new MessagePacketType('DOTA_UM_HeroRelicProgress', 572);
const dotaUmAbilityDraftRequestAbility = new MessagePacketType('DOTA_UM_AbilityDraftRequestAbility', 573);
const dotaUmItemSold = new MessagePacketType('DOTA_UM_ItemSold', 574);
const dotaUmDamageReport = new MessagePacketType('DOTA_UM_DamageReport', 575);
const dotaUmSalutePlayer = new MessagePacketType('DOTA_UM_SalutePlayer', 576);
const dotaUmTipAlert = new MessagePacketType('DOTA_UM_TipAlert', 577);
const dotaUmReplaceQueryUnit = new MessagePacketType('DOTA_UM_ReplaceQueryUnit', 578);
const dotaUmEmptyTeleportAlert = new MessagePacketType('DOTA_UM_EmptyTeleportAlert', 579);
const dotaUmMarsArenaOfBloodAttack = new MessagePacketType('DOTA_UM_MarsArenaOfBloodAttack', 580);
const dotaUmEsArcanaCombo = new MessagePacketType('DOTA_UM_ESArcanaCombo', 581);
const dotaUmEsArcanaComboSummary = new MessagePacketType('DOTA_UM_ESArcanaComboSummary', 582);
const dotaUmHighFiveLeftHanging = new MessagePacketType('DOTA_UM_HighFiveLeftHanging', 583);
const dotaUmHighFiveCompleted = new MessagePacketType('DOTA_UM_HighFiveCompleted', 584);
const dotaUmShovelUnearth = new MessagePacketType('DOTA_UM_ShovelUnearth', 585);
const dotaUmRadarAlert = new MessagePacketType('DOTA_UM_RadarAlert', 587);
const dotaUmAllStarEvent = new MessagePacketType('DOTA_UM_AllStarEvent', 588);
const dotaUmTalentTreeAlert = new MessagePacketType('DOTA_UM_TalentTreeAlert', 589);
const dotaUmQueuedOrderRemoved = new MessagePacketType('DOTA_UM_QueuedOrderRemoved', 590);
const dotaUmDebugChallenge = new MessagePacketType('DOTA_UM_DebugChallenge', 591);
const dotaUmOmArcanaCombo = new MessagePacketType('DOTA_UM_OMArcanaCombo', 592);
const dotaUmFoundNeutralItem = new MessagePacketType('DOTA_UM_FoundNeutralItem', 593);
const dotaUmOutpostCaptured = new MessagePacketType('DOTA_UM_OutpostCaptured', 594);
const dotaUmOutpostGrantedXp = new MessagePacketType('DOTA_UM_OutpostGrantedXP', 595);
const dotaUmMoveCameraToUnit = new MessagePacketType('DOTA_UM_MoveCameraToUnit', 596);
const dotaUmPauseMinigameData = new MessagePacketType('DOTA_UM_PauseMinigameData', 597);
const dotaUmVersusScenePlayerBehavior = new MessagePacketType('DOTA_UM_VersusScene_PlayerBehavior', 598);
const dotaUmQopArcanaSummary = new MessagePacketType('DOTA_UM_QoP_ArcanaSummary', 600);
const dotaUmHotPotatoCreated = new MessagePacketType('DOTA_UM_HotPotato_Created', 601);
const dotaUmHotPotatoExploded = new MessagePacketType('DOTA_UM_HotPotato_Exploded', 602);
const dotaUmWkArcanaProgress = new MessagePacketType('DOTA_UM_WK_Arcana_Progress', 603);
const dotaUmGuildChallengeProgress = new MessagePacketType('DOTA_UM_GuildChallenge_Progress', 604);
const dotaUmWrArcanaProgress = new MessagePacketType('DOTA_UM_WRArcanaProgress', 605);
const dotaUmWrArcanaSummary = new MessagePacketType('DOTA_UM_WRArcanaSummary', 606);
const dotaUmEmptyItemSlotAlert = new MessagePacketType('DOTA_UM_EmptyItemSlotAlert', 607);
const dotaUmAghsStatusAlert = new MessagePacketType('DOTA_UM_AghsStatusAlert', 608);
const dotaUmPingConfirmation = new MessagePacketType('DOTA_UM_PingConfirmation', 609);
const dotaUmMutedPlayers = new MessagePacketType('DOTA_UM_MutedPlayers', 610);
const dotaUmContextualTip = new MessagePacketType('DOTA_UM_ContextualTip', 611);
const dotaUmChatMessage = new MessagePacketType('DOTA_UM_ChatMessage', 612);
const dotaUmNeutralCampAlert = new MessagePacketType('DOTA_UM_NeutralCampAlert', 613);
const dotaUmRockPaperScissorsStarted = new MessagePacketType('DOTA_UM_RockPaperScissorsStarted', 614);
const dotaUmRockPaperScissorsFinished = new MessagePacketType('DOTA_UM_RockPaperScissorsFinished', 615);
const dotaUmDuelOpponentKilled = new MessagePacketType('DOTA_UM_DuelOpponentKilled', 616);
const dotaUmDuelAccepted = new MessagePacketType('DOTA_UM_DuelAccepted', 617);
const dotaUmDuelRequested = new MessagePacketType('DOTA_UM_DuelRequested', 618);
const dotaUmMuertaReleaseEventAssignedTargetKilled = new MessagePacketType('DOTA_UM_MuertaReleaseEvent_AssignedTargetKilled', 619);
const dotaUmPlayerDraftSuggestPick = new MessagePacketType('DOTA_UM_PlayerDraftSuggestPick', 620);
const dotaUmPlayerDraftPick = new MessagePacketType('DOTA_UM_PlayerDraftPick', 621);
const dotaUmUpdateLinearProjectileCpData = new MessagePacketType('DOTA_UM_UpdateLinearProjectileCPData', 622);
const dotaUmGiftPlayer = new MessagePacketType('DOTA_UM_GiftPlayer', 623);
const dotaUmFacetPing = new MessagePacketType('DOTA_UM_FacetPing', 624);
const dotaUmInnatePing = new MessagePacketType('DOTA_UM_InnatePing', 625);
const dotaUmRoshanTimer = new MessagePacketType('DOTA_UM_RoshanTimer', 626);
const dotaUmNeutralCraftAvailable = new MessagePacketType('DOTA_UM_NeutralCraftAvailable', 627);
const dotaUmTimerAlert = new MessagePacketType('DOTA_UM_TimerAlert', 628);
const dotaUmMadstoneAlert = new MessagePacketType('DOTA_UM_MadstoneAlert', 629);
const dotaUmCourierLeftFountainAlert = new MessagePacketType('DOTA_UM_CourierLeftFountainAlert', 630);
const dotaUmMonsterHunterInvestigationsAvailable = new MessagePacketType('DOTA_UM_MonsterHunter_InvestigationsAvailable', 631);
const dotaUmMonsterHunterInvestigationGameState = new MessagePacketType('DOTA_UM_MonsterHunter_InvestigationGameState', 632);
const dotaUmMonsterHunterHuntAlert = new MessagePacketType('DOTA_UM_MonsterHunter_HuntAlert', 633);
const dotaUmTormentorTimer = new MessagePacketType('DOTA_UM_TormentorTimer', 634);
const dotaUmKillEffect = new MessagePacketType('DOTA_UM_KillEffect', 635);
const dotaUmGiveItem = new MessagePacketType('DOTA_UM_GiveItem', 636);

export default MessagePacketType;
