import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level protobuf types
 * (demo packets, message packets, string table decoders, send tables serializer decoder).
 *
 * Game-specific bootstraps call {@link EngineBootstrap.run} first, then layer
 * their own registrations on top of the same registry.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        Bootstrap._registerDemoPacketTypes(registry);
        Bootstrap._registerMessagePacketTypes(registry);
        Bootstrap._registerStringTableTypes(registry);
        Bootstrap._registerStringTableDecoders(registry);

        const pp = registry.getProtoProvider();

        registry.setSendTablesSerializerDecoder(pp.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDemoPacketTypes(registry) {
        const pp = registry.getProtoProvider();

        registry.registerDemoType(DemoPacketType.DEM_STOP, pp.DEMO.lookupType('CDemoStop'));
        registry.registerDemoType(DemoPacketType.DEM_FILE_HEADER, pp.DEMO.lookupType('CDemoFileHeader'));
        registry.registerDemoType(DemoPacketType.DEM_FILE_INFO, pp.DEMO.lookupType('CDemoFileInfo'));
        registry.registerDemoType(DemoPacketType.DEM_SYNC_TICK, pp.DEMO.lookupType('CDemoSyncTick'));
        registry.registerDemoType(DemoPacketType.DEM_SEND_TABLES, pp.DEMO.lookupType('CDemoSendTables'));
        registry.registerDemoType(DemoPacketType.DEM_CLASS_INFO, pp.DEMO.lookupType('CDemoClassInfo'));
        registry.registerDemoType(DemoPacketType.DEM_STRING_TABLES, pp.DEMO.lookupType('CDemoStringTables'));
        registry.registerDemoType(DemoPacketType.DEM_PACKET, pp.DEMO.lookupType('CDemoPacket'));
        registry.registerDemoType(DemoPacketType.DEM_SIGNON_PACKET, pp.DEMO.lookupType('CDemoPacket'));
        registry.registerDemoType(DemoPacketType.DEM_CONSOLE_CMD, pp.DEMO.lookupType('CDemoConsoleCmd'));
        registry.registerDemoType(DemoPacketType.DEM_CUSTOM_DATA, pp.DEMO.lookupType('CDemoCustomData'));
        registry.registerDemoType(DemoPacketType.DEM_CUSTOM_DATA_CALLBACKS, pp.DEMO.lookupType('CDemoCustomDataCallbacks'));
        registry.registerDemoType(DemoPacketType.DEM_USER_CMD, pp.DEMO.lookupType('CDemoUserCmd'));
        registry.registerDemoType(DemoPacketType.DEM_FULL_PACKET, pp.DEMO.lookupType('CDemoFullPacket'));
        registry.registerDemoType(DemoPacketType.DEM_SAVE_GAME, pp.DEMO.lookupType('CDemoSaveGame'));
        registry.registerDemoType(DemoPacketType.DEM_SPAWN_GROUPS, pp.DEMO.lookupType('CDemoSpawnGroups'));
        registry.registerDemoType(DemoPacketType.DEM_ANIMATION_DATA, pp.DEMO.lookupType('CDemoAnimationData'));
        registry.registerDemoType(DemoPacketType.DEM_ANIMATION_HEADER, pp.DEMO.lookupType('CDemoAnimationHeader'));
        registry.registerDemoType(DemoPacketType.DEM_RECOVERY, pp.DEMO.lookupType('CDemoRecovery'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerMessagePacketTypes(registry) {
        const pp = registry.getProtoProvider();

        registry.registerMessageType(MessagePacketType.NET_TICK, pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick'));
        registry.registerMessageType(MessagePacketType.NET_SET_CON_VAR, pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_SetConVar'));
        registry.registerMessageType(MessagePacketType.NET_SIGNON_STATE, pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState'));
        registry.registerMessageType(MessagePacketType.NET_SPAWN_GROUP_LOAD, pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_Load'));
        registry.registerMessageType(MessagePacketType.NET_SPAWN_GROUP_MANIFEST_UPDATE, pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_ManifestUpdate'));
        registry.registerMessageType(MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK, pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_SetCreationTick'));

        registry.registerMessageType(MessagePacketType.SVC_SERVER_INFO, pp.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo'));
        registry.registerMessageType(MessagePacketType.SVC_CLASS_INFO, pp.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo'));
        registry.registerMessageType(MessagePacketType.SVC_CREATE_STRING_TABLE, pp.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable'));
        registry.registerMessageType(MessagePacketType.SVC_UPDATE_STRING_TABLE, pp.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable'));
        registry.registerMessageType(MessagePacketType.SVC_VOICE_INIT, pp.NET_MESSAGES.lookupType('CSVCMsg_VoiceInit'));
        registry.registerMessageType(MessagePacketType.SVC_VOICE_DATA, pp.NET_MESSAGES.lookupType('CSVCMsg_VoiceData'));
        registry.registerMessageType(MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES, pp.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables'));
        registry.registerMessageType(MessagePacketType.SVC_PACKET_ENTITIES, pp.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities'));
        registry.registerMessageType(MessagePacketType.SVC_HLTV_STATUS, pp.NET_MESSAGES.lookupType('CSVCMsg_HLTVStatus'));
        registry.registerMessageType(MessagePacketType.SVC_USER_COMMANDS, pp.NET_MESSAGES.lookupType('CSVCMsg_UserCommands'));

        registry.registerMessageType(MessagePacketType.USER_MESSAGE_VOICE_MASK, pp.USER_MESSAGES.lookupType('CUserMessageVoiceMask'));
        registry.registerMessageType(MessagePacketType.USER_MESSAGE_SEND_AUDIO, pp.USER_MESSAGES.lookupType('CUserMessageSendAudio'));
        registry.registerMessageType(MessagePacketType.USER_MESSAGE_PARTICLE_MANAGER, pp.USER_MESSAGES.lookupType('CUserMsg_ParticleManager'));
        registry.registerMessageType(MessagePacketType.USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL, pp.USER_MESSAGES.lookupType('CUserMessage_PlayResponseConditional'));

        registry.registerMessageType(MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST, pp.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEventList'));
        registry.registerMessageType(MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT, pp.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEvent'));
        registry.registerMessageType(MessagePacketType.GE_SOS_START_SOUND_EVENT, pp.GAME_EVENTS.lookupType('CMsgSosStartSoundEvent'));
        registry.registerMessageType(MessagePacketType.GE_SOS_STOP_SOUND_EVENT, pp.GAME_EVENTS.lookupType('CMsgSosStopSoundEvent'));
        registry.registerMessageType(MessagePacketType.GE_SOS_SET_SOUND_EVENT_PARAMS, pp.GAME_EVENTS.lookupType('CMsgSosSetSoundEventParams'));
        registry.registerMessageType(MessagePacketType.GE_SOS_STOP_SOUND_EVENT_HASH, pp.GAME_EVENTS.lookupType('CMsgSosStopSoundEventHash'));

        registry.registerMessageType(MessagePacketType.TE_EFFECT_DISPATCH, pp.TEMPORARY_ENTITIES.lookupType('CMsgTEEffectDispatch'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerStringTableDecoders(registry) {
        const pp = registry.getProtoProvider();

        registry.registerStringTableDecoder(StringTableType.USER_INFO, pp.NETWORK_BASE_TYPES.lookupType('CMsgPlayerInfo'));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerStringTableTypes(registry) {
        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS);
        registry.registerStringTableType(StringTableType.DECAL_PRE_CACHE);
        registry.registerStringTableType(StringTableType.EFFECT_DISPATCH);
        registry.registerStringTableType(StringTableType.ENTITY_NAMES);
        registry.registerStringTableType(StringTableType.GENERIC_PRE_CACHE);
        registry.registerStringTableType(StringTableType.INFO_PANEL);
        registry.registerStringTableType(StringTableType.INSTANCE_BASE_LINE);
        registry.registerStringTableType(StringTableType.LIGHT_STYLES);
        registry.registerStringTableType(StringTableType.RESPONSE_KEYS);
        registry.registerStringTableType(StringTableType.SCENES);
        registry.registerStringTableType(StringTableType.SERVER_QUERY_INFO);
        registry.registerStringTableType(StringTableType.USER_INFO);
        registry.registerStringTableType(StringTableType.V_GUI_SCREEN);
        registry.registerStringTableType(StringTableType.ANIM_TASK_TYPES);
        registry.registerStringTableType(StringTableType.ANIM_ASSET_DATA);
    }
}

export default Bootstrap;
