import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

import StringTableEntry from '#data/tables/string/StringTableEntry.js';

/**
 * One-time runtime initialization of the protobuf schema.
 *
 * Enum instances (DemoPacketType, MessagePacketType, etc.) are declared as module-level
 * singletons with their `proto` field set to null. Bootstrap wires those fields to the
 * actual protobuf types resolved from the compiled schema.
 *
 * Must be called once before parsing begins. The stored ProtoProvider is also used
 * by ParserEngine to send the schema to worker threads via postMessage.
 *
 * Game-specific adapters extend this class to register additional
 * proto types on top of the base engine types.
 */
class Bootstrap {
    static protoProvider = null;

    /**
     * @public
     * @static
     * @param {ProtoProvider} pp
     */
    static run(pp) {
        if (Bootstrap.protoProvider !== null) {
            throw new Error('Bootstrap.run() has already been called');
        }

        Bootstrap.protoProvider = pp;

        Bootstrap._initDemoPacketTypes(pp);
        Bootstrap._initMessagePacketTypes(pp);
        Bootstrap._initStringTableDecoders(pp);

        DemoPacketHandler.flattenedSerializer = pp.NET_MESSAGES.lookupType('CSVCMsg_FlattenedSerializer');
    }

    static _initDemoPacketTypes(pp) {
        DemoPacketType.DEM_STOP.proto = pp.DEMO.lookupType('CDemoStop');
        DemoPacketType.DEM_FILE_HEADER.proto = pp.DEMO.lookupType('CDemoFileHeader');
        DemoPacketType.DEM_FILE_INFO.proto = pp.DEMO.lookupType('CDemoFileInfo');
        DemoPacketType.DEM_SYNC_TICK.proto = pp.DEMO.lookupType('CDemoSyncTick');
        DemoPacketType.DEM_SEND_TABLES.proto = pp.DEMO.lookupType('CDemoSendTables');
        DemoPacketType.DEM_CLASS_INFO.proto = pp.DEMO.lookupType('CDemoClassInfo');
        DemoPacketType.DEM_STRING_TABLES.proto = pp.DEMO.lookupType('CDemoStringTables');
        DemoPacketType.DEM_PACKET.proto = pp.DEMO.lookupType('CDemoPacket');
        DemoPacketType.DEM_SIGNON_PACKET.proto = DemoPacketType.DEM_PACKET.proto;
        DemoPacketType.DEM_CONSOLE_CMD.proto = pp.DEMO.lookupType('CDemoConsoleCmd');
        DemoPacketType.DEM_CUSTOM_DATA.proto = pp.DEMO.lookupType('CDemoCustomData');
        DemoPacketType.DEM_CUSTOM_DATA_CALLBACKS.proto = pp.DEMO.lookupType('CDemoCustomDataCallbacks');
        DemoPacketType.DEM_USER_CMD.proto = pp.DEMO.lookupType('CDemoUserCmd');
        DemoPacketType.DEM_FULL_PACKET.proto = pp.DEMO.lookupType('CDemoFullPacket');
        DemoPacketType.DEM_SAVE_GAME.proto = pp.DEMO.lookupType('CDemoSaveGame');
        DemoPacketType.DEM_SPAWN_GROUPS.proto = pp.DEMO.lookupType('CDemoSpawnGroups');
        DemoPacketType.DEM_ANIMATION_DATA.proto = pp.DEMO.lookupType('CDemoAnimationData');
        DemoPacketType.DEM_ANIMATION_HEADER.proto = pp.DEMO.lookupType('CDemoAnimationHeader');
        DemoPacketType.DEM_RECOVERY.proto = pp.DEMO.lookupType('CDemoRecovery');
    }

    static _initMessagePacketTypes(pp) {
        MessagePacketType.NET_TICK.proto = pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_Tick');
        MessagePacketType.NET_SET_CON_VAR.proto = pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_SetConVar');
        MessagePacketType.NET_SIGNON_STATE.proto = pp.NETWORK_BASE_TYPES.lookupType('CNETMsg_SignonState');
        MessagePacketType.NET_SPAWN_GROUP_LOAD.proto = pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_Load');
        MessagePacketType.NET_SPAWN_GROUP_MANIFEST_UPDATE.proto = pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_ManifestUpdate');
        MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK.proto = pp.NET_MESSAGES.lookupType('CNETMsg_SpawnGroup_SetCreationTick');

        MessagePacketType.SVC_SERVER_INFO.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_ServerInfo');
        MessagePacketType.SVC_CLASS_INFO.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_ClassInfo');
        MessagePacketType.SVC_CREATE_STRING_TABLE.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_CreateStringTable');
        MessagePacketType.SVC_UPDATE_STRING_TABLE.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_UpdateStringTable');
        MessagePacketType.SVC_VOICE_INIT.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_VoiceInit');
        MessagePacketType.SVC_VOICE_DATA.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_VoiceData');
        MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_ClearAllStringTables');
        MessagePacketType.SVC_PACKET_ENTITIES.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_PacketEntities');
        MessagePacketType.SVC_HLTV_STATUS.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_HLTVStatus');
        MessagePacketType.SVC_USER_COMMANDS.proto = pp.NET_MESSAGES.lookupType('CSVCMsg_UserCommands');

        MessagePacketType.USER_MESSAGE_VOICE_MASK.proto = pp.USER_MESSAGES.lookupType('CUserMessageVoiceMask');
        MessagePacketType.USER_MESSAGE_SEND_AUDIO.proto = pp.USER_MESSAGES.lookupType('CUserMessageSendAudio');
        MessagePacketType.USER_MESSAGE_PARTICLE_MANAGER.proto = pp.USER_MESSAGES.lookupType('CUserMsg_ParticleManager');
        MessagePacketType.USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL.proto = pp.USER_MESSAGES.lookupType('CUserMessage_PlayResponseConditional');

        MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST.proto = pp.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEventList');
        MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT.proto = pp.GAME_EVENTS.lookupType('CMsgSource1LegacyGameEvent');
        MessagePacketType.GE_SOS_START_SOUND_EVENT.proto = pp.GAME_EVENTS.lookupType('CMsgSosStartSoundEvent');
        MessagePacketType.GE_SOS_STOP_SOUND_EVENT.proto = pp.GAME_EVENTS.lookupType('CMsgSosStopSoundEvent');
        MessagePacketType.GE_SOS_SET_SOUND_EVENT_PARAMS.proto = pp.GAME_EVENTS.lookupType('CMsgSosSetSoundEventParams');
        MessagePacketType.GE_SOS_STOP_SOUND_EVENT_HASH.proto = pp.GAME_EVENTS.lookupType('CMsgSosStopSoundEventHash');

        MessagePacketType.TE_EFFECT_DISPATCH.proto = pp.TEMPORARY_ENTITIES.lookupType('CMsgTEEffectDispatch');
    }

    static _initStringTableDecoders(pp) {
        StringTableEntry.registerDecoder(StringTableType.USER_INFO, pp.NETWORK_BASE_TYPES.lookupType('CMsgPlayerInfo'));
    }
}

export default Bootstrap;
