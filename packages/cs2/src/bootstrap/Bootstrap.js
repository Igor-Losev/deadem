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
        Bootstrap._registerCs2TemporaryEntities(registry);
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

        registry.registerFieldDecoderOverride('m_pGameModeRules', FieldDecoderDescriptor.GAME_MODE_RULES);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2UserMessages(registry) {
        const pp = registry.getProtoProvider();

        registry.registerMessageType(MessagePacketType.USER_MESSAGE_SAY_TEXT, pp.USER_MESSAGES.lookupType('CUserMessageSayText'));
        registry.registerMessageType(MessagePacketType.ENTITY_MESSAGE_REMOVE_ALL_DECALS, pp.USER_MESSAGES.lookupType('CEntityMessageRemoveAllDecals'));

        registry.registerMessageType(MessagePacketType.CS_UM_VGUI_MENU, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_VGUIMenu'));
        registry.registerMessageType(MessagePacketType.CS_UM_HUD_TEXT, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_HudText'));
        registry.registerMessageType(MessagePacketType.CS_UM_HUD_MSG, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_HudMsg'));
        registry.registerMessageType(MessagePacketType.CS_UM_SHAKE, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_Shake'));
        registry.registerMessageType(MessagePacketType.CS_UM_FADE, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_Fade'));
        registry.registerMessageType(MessagePacketType.CS_UM_DAMAGE, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_Damage'));
        registry.registerMessageType(MessagePacketType.CS_UM_RADIO_TEXT, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_RadioText'));
        registry.registerMessageType(MessagePacketType.CS_UM_HINT_TEXT, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_HintText'));
        registry.registerMessageType(MessagePacketType.CS_UM_ADJUST_MONEY, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_AdjustMoney'));
        registry.registerMessageType(MessagePacketType.CS_UM_KILL_CAM, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_KillCam'));
        registry.registerMessageType(MessagePacketType.CS_UM_MATCH_END_CONDITIONS, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_MatchEndConditions'));
        registry.registerMessageType(MessagePacketType.CS_UM_PLAYER_STATS_UPDATE, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_PlayerStatsUpdate'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_START, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_VoteStart'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_PASS, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_VotePass'));
        registry.registerMessageType(MessagePacketType.CS_UM_VOTE_FAILED, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_VoteFailed'));
        registry.registerMessageType(MessagePacketType.CS_UM_SERVER_RANK_REVEAL_ALL, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_ServerRankRevealAll'));
        registry.registerMessageType(MessagePacketType.CS_UM_SEND_PLAYER_ITEM_FOUND, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_SendPlayerItemFound'));
        registry.registerMessageType(MessagePacketType.CS_UM_REPORT_HIT, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_ReportHit'));
        registry.registerMessageType(MessagePacketType.CS_UM_WEAPON_SOUND, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_WeaponSound'));
        registry.registerMessageType(MessagePacketType.CS_UM_XP_UPDATE, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_XpUpdate'));
        registry.registerMessageType(MessagePacketType.CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_EndOfMatchAllPlayersData'));
        registry.registerMessageType(MessagePacketType.CS_UM_ROUND_END_REPORT_DATA, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_RoundEndReportData'));
        registry.registerMessageType(MessagePacketType.CS_UM_WEAPON_MAG_DROP, pp.CS_USER_MESSAGES.lookupType('CCSUsrMsg_WeaponMagDrop'));
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
    static _registerCs2TemporaryEntities(registry) {
        const te = registry.getProtoProvider().TEMPORARY_ENTITIES;

        registry.registerMessageType(MessagePacketType.TE_DECAL, te.lookupType('CMsgTEDecal'));
        registry.registerMessageType(MessagePacketType.TE_WORLD_DECAL, te.lookupType('CMsgTEWorldDecal'));
        registry.registerMessageType(MessagePacketType.TE_EXPLOSION, te.lookupType('CMsgTEExplosion'));
        registry.registerMessageType(MessagePacketType.TE_PHYSICS_PROP, te.lookupType('CMsgTEPhysicsProp'));
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
