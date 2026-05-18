import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Counter-Strike 2-specific user messages and game events on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerCs2FieldRules(registry);
        Bootstrap._registerCs2UserMessages(registry);
        Bootstrap._registerCs2GameEvents(registry);
        Bootstrap._registerCs2StringTableTypes(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2FieldRules(registry) {
        registry.registerFieldTypeDecoder('CGlobalSymbol', FieldDecoderDescriptor.STRING);
        registry.registerFieldTypeDecoder('CUtlBinaryBlock', FieldDecoderDescriptor.BINARY_BLOCK);
        registry.registerFieldTypeDecoder('Quaternion', FieldDecoderDescriptor.createVector(4));

        registry.registerFixedTableType('CLightComponent');
        registry.registerFixedTableType('CPlayerLocalData');

        registry.registerFieldDecoderOverride('m_pGameModeRules', FieldDecoderDescriptor.GAME_MODE_RULES);
        registry.registerFieldEncoderOverride('m_flAnimTime', 'simtime');
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2UserMessages(registry) {
        const um = registry.getProtoProvider().CS_USER_MESSAGES;

        registry.registerMessageType(MessagePacketType.CS_UM_VGUI_MENU, um.lookupType('CCSUsrMsg_VGUIMenu'));
        registry.registerMessageType(MessagePacketType.CS_UM_HUD_TEXT, um.lookupType('CCSUsrMsg_HudText'));
        registry.registerMessageType(MessagePacketType.CS_UM_HUD_MSG, um.lookupType('CCSUsrMsg_HudMsg'));
        registry.registerMessageType(MessagePacketType.CS_UM_SHAKE, um.lookupType('CCSUsrMsg_Shake'));
        registry.registerMessageType(MessagePacketType.CS_UM_FADE, um.lookupType('CCSUsrMsg_Fade'));
        registry.registerMessageType(MessagePacketType.CS_UM_DAMAGE, um.lookupType('CCSUsrMsg_Damage'));
        registry.registerMessageType(MessagePacketType.CS_UM_RADIO_TEXT, um.lookupType('CCSUsrMsg_RadioText'));
        registry.registerMessageType(MessagePacketType.CS_UM_HINT_TEXT, um.lookupType('CCSUsrMsg_HintText'));
        registry.registerMessageType(MessagePacketType.CS_UM_ADJUST_MONEY, um.lookupType('CCSUsrMsg_AdjustMoney'));
        registry.registerMessageType(MessagePacketType.CS_UM_KILL_CAM, um.lookupType('CCSUsrMsg_KillCam'));
        registry.registerMessageType(MessagePacketType.CS_UM_MATCH_END_CONDITIONS, um.lookupType('CCSUsrMsg_MatchEndConditions'));
        registry.registerMessageType(MessagePacketType.CS_UM_PLAYER_STATS_UPDATE, um.lookupType('CCSUsrMsg_PlayerStatsUpdate'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_START, um.lookupType('CCSUsrMsg_VoteStart'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_PASS, um.lookupType('CCSUsrMsg_VotePass'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_FAILED, um.lookupType('CCSUsrMsg_VoteFailed'));
        registry.registerMessageType(MessagePacketType.CS_UM_SERVER_RANK_REVEAL_ALL, um.lookupType('CCSUsrMsg_ServerRankRevealAll'));
        registry.registerMessageType(MessagePacketType.CS_UM_REPORT_HIT, um.lookupType('CCSUsrMsg_ReportHit'));
        registry.registerMessageType(MessagePacketType.CS_UM_WEAPON_SOUND, um.lookupType('CCSUsrMsg_WeaponSound'));
        registry.registerMessageType(MessagePacketType.CS_UM_XP_UPDATE, um.lookupType('CCSUsrMsg_XpUpdate'));
        registry.registerMessageType(MessagePacketType.CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA, um.lookupType('CCSUsrMsg_EndOfMatchAllPlayersData'));
        registry.registerMessageType(MessagePacketType.CS_UM_ROUND_END_REPORT_DATA, um.lookupType('CCSUsrMsg_RoundEndReportData'));
        registry.registerMessageType(MessagePacketType.CS_UM_WEAPON_MAG_DROP, um.lookupType('CCSUsrMsg_WeaponMagDrop'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2GameEvents(registry) {
        const ge = registry.getProtoProvider().CS_GAME_EVENTS;

        registry.registerMessageType(MessagePacketType.GE_PLAYER_ANIM_EVENT, ge.lookupType('CMsgTEPlayerAnimEvent'));
        registry.registerMessageType(MessagePacketType.GE_RADIO_ICON_EVENT, ge.lookupType('CMsgTERadioIcon'));
        registry.registerMessageType(MessagePacketType.GE_FIRE_BULLETS, ge.lookupType('CMsgTEFireBullets'));
        registry.registerMessageType(MessagePacketType.GE_PLAYER_BULLET_HIT, ge.lookupType('CMsgPlayerBulletHit'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2StringTableTypes(registry) {
        registry.registerStringTableType(StringTableType.SERVER_AVATAR_OVERRIDES);
    }
}

export default Bootstrap;
