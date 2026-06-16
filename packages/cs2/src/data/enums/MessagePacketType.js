import { MessagePacketType as EngineMessagePacketType } from '@deademx/engine';

class MessagePacketType extends EngineMessagePacketType {
    static get USER_MESSAGE_SAY_TEXT() { return umSayText; }

    static get CS_UM_VGUI_MENU() { return csUmVguiMenu; }
    static get CS_UM_HUD_TEXT() { return csUmHudText; }
    static get CS_UM_HUD_MSG() { return csUmHudMsg; }
    static get CS_UM_SHAKE() { return csUmShake; }
    static get CS_UM_FADE() { return csUmFade; }
    static get CS_UM_DAMAGE() { return csUmDamage; }
    static get CS_UM_RADIO_TEXT() { return csUmRadioText; }
    static get CS_UM_HINT_TEXT() { return csUmHintText; }
    static get CS_UM_ADJUST_MONEY() { return csUmAdjustMoney; }
    static get CS_UM_KILL_CAM() { return csUmKillCam; }
    static get CS_UM_MATCH_END_CONDITIONS() { return csUmMatchEndConditions; }
    static get CS_UM_PLAYER_STATS_UPDATE() { return csUmPlayerStatsUpdate; }
    static get CS_UM_VOTE_START() { return csUmVoteStart; }
    static get CS_UM_VOTE_PASS() { return csUmVotePass; }
    static get CS_UM_VOTE_FAILED() { return csUmVoteFailed; }
    static get CS_UM_SERVER_RANK_REVEAL_ALL() { return csUmServerRankRevealAll; }
    static get CS_UM_SEND_PLAYER_ITEM_FOUND() { return csUmSendPlayerItemFound; }
    static get CS_UM_REPORT_HIT() { return csUmReportHit; }
    static get CS_UM_WEAPON_SOUND() { return csUmWeaponSound; }
    static get CS_UM_XP_UPDATE() { return csUmXpUpdate; }
    static get CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA() { return csUmEndOfMatchAllPlayersData; }
    static get CS_UM_ROUND_END_REPORT_DATA() { return csUmRoundEndReportData; }
    static get CS_UM_WEAPON_MAG_DROP() { return csUmWeaponMagDrop; }

    static get GE_PLAYER_ANIM_EVENT() { return gePlayerAnimEvent; }
    static get GE_RADIO_ICON_EVENT() { return geRadioIconEvent; }
    static get GE_FIRE_BULLETS() { return geFireBullets; }
    static get GE_PLAYER_BULLET_HIT() { return gePlayerBulletHit; }

    static get TE_DECAL() { return teDecal; }
    static get TE_WORLD_DECAL() { return teWorldDecal; }
    static get TE_EXPLOSION() { return teExplosion; }
    static get TE_PHYSICS_PROP() { return tePhysicsProp; }
}

const umSayText = new MessagePacketType('UM_SayText', 117);

const csUmVguiMenu = new MessagePacketType('CS_UM_VGUIMenu', 301);
const csUmHudText = new MessagePacketType('CS_UM_HudText', 304);
const csUmHudMsg = new MessagePacketType('CS_UM_HudMsg', 308);
const csUmShake = new MessagePacketType('CS_UM_Shake', 312);
const csUmFade = new MessagePacketType('CS_UM_Fade', 313);
const csUmDamage = new MessagePacketType('CS_UM_Damage', 321);
const csUmRadioText = new MessagePacketType('CS_UM_RadioText', 322);
const csUmHintText = new MessagePacketType('CS_UM_HintText', 323);
const csUmAdjustMoney = new MessagePacketType('CS_UM_AdjustMoney', 327);
const csUmKillCam = new MessagePacketType('CS_UM_KillCam', 330);
const csUmMatchEndConditions = new MessagePacketType('CS_UM_MatchEndConditions', 334);
const csUmPlayerStatsUpdate = new MessagePacketType('CS_UM_PlayerStatsUpdate', 336);
const csUmVoteStart = new MessagePacketType('CS_UM_VoteStart', 346);
const csUmVotePass = new MessagePacketType('CS_UM_VotePass', 347);
const csUmVoteFailed = new MessagePacketType('CS_UM_VoteFailed', 348);
const csUmServerRankRevealAll = new MessagePacketType('CS_UM_ServerRankRevealAll', 350);
const csUmSendPlayerItemFound = new MessagePacketType('CS_UM_SendPlayerItemFound', 363);
const csUmReportHit = new MessagePacketType('CS_UM_ReportHit', 364);
const csUmWeaponSound = new MessagePacketType('CS_UM_WeaponSound', 369);
const csUmXpUpdate = new MessagePacketType('CS_UM_XpUpdate', 365);
const csUmEndOfMatchAllPlayersData = new MessagePacketType('CS_UM_EndOfMatchAllPlayersData', 375);
const csUmRoundEndReportData = new MessagePacketType('CS_UM_RoundEndReportData', 379);
const csUmWeaponMagDrop = new MessagePacketType('CS_UM_WeaponMagDrop', 389);

const gePlayerAnimEvent = new MessagePacketType('GE_PlayerAnimEventId', 450);
const geRadioIconEvent = new MessagePacketType('GE_RadioIconEventId', 451);
const geFireBullets = new MessagePacketType('GE_FireBulletsId', 452);
const gePlayerBulletHit = new MessagePacketType('GE_PlayerBulletHitId', 453);

const teDecal = new MessagePacketType('TE_Decal', 410);
const teWorldDecal = new MessagePacketType('TE_WorldDecal', 411);
const teExplosion = new MessagePacketType('TE_Explosion', 419);
const tePhysicsProp = new MessagePacketType('TE_PhysicsProp', 423);

export default MessagePacketType;
