import assert from 'node:assert/strict';

import ProtoProvider from '../../providers/ProtoProviderInstance.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class DemoPacketType {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {number} id
     * @param {*|null} proto
     */
    constructor(code, id, proto) {
        assert(typeof code === 'string' && code.length > 0);
        assert(Number.isInteger(id));

        this._code = code;
        this._id = id;
        this._proto = proto;

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    /**
     * @public
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get proto() {
        return this._proto;
    }

    /**
     * @public
     * @static
     * @param {String} code
     * @returns {DemoPacketType|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @param {number} id
     * @returns {DemoPacketType|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    static get DEM_ERROR() { return demError; }
    static get DEM_STOP() { return demStop; }
    static get DEM_FILE_HEADER() { return demFileHeader; }
    static get DEM_FILE_INFO() { return demFileInfo; }
    static get DEM_SYNC_TICK() { return demSyncTick; }
    static get DEM_SEND_TABLES() { return demSendTables; }
    static get DEM_CLASS_INFO() { return demClassInfo; }
    static get DEM_STRING_TABLES() { return demStringTables; }
    static get DEM_PACKET() { return demPacket; }
    static get DEM_SIGNON_PACKET() { return demSignonPacket; }
    static get DEM_CONSOLE_CMD() { return demConsoleCmd; }
    static get DEM_CUSTOM_DATA() { return demCustomData; }
    static get DEM_CUSTOM_DATA_CALLBACKS() { return demCustomDataCallbacks; }
    static get DEM_USER_CMD() { return demUserCmd; }
    static get DEM_FULL_PACKET() { return demFullPacket; }
    static get DEM_SAVE_GAME() { return demSaveGame; }
    static get DEM_SPAWN_GROUPS() { return demSpawnGroups; }
    static get DEM_ANIMATION_DATA() { return demAnimationData; }
    static get DEM_ANIMATION_HEADER() { return demAnimationHeader; }
    static get DEM_RECOVERY() { return demRecovery; }
}

const CDemoAnimationData = ProtoProvider.DEMO.lookupType('CDemoAnimationData');
const CDemoAnimationHeader = ProtoProvider.DEMO.lookupType('CDemoAnimationHeader');
const CDemoClassInfo = ProtoProvider.DEMO.lookupType('CDemoClassInfo');
const CDemoConsoleCmd = ProtoProvider.DEMO.lookupType('CDemoConsoleCmd');
const CDemoCustomData = ProtoProvider.DEMO.lookupType('CDemoCustomData');
const CDemoCustomDataCallbacks = ProtoProvider.DEMO.lookupType('CDemoCustomDataCallbacks');
const CDemoFileHeader = ProtoProvider.DEMO.lookupType('CDemoFileHeader');
const CDemoFileInfo = ProtoProvider.DEMO.lookupType('CDemoFileInfo');
const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');
const CDemoRecovery = ProtoProvider.DEMO.lookupType('CDemoRecovery');
const CDemoSaveGame = ProtoProvider.DEMO.lookupType('CDemoSaveGame');
const CDemoSendTables = ProtoProvider.DEMO.lookupType('CDemoSendTables');
const CDemoSpawnGroups = ProtoProvider.DEMO.lookupType('CDemoSpawnGroups');
const CDemoStop = ProtoProvider.DEMO.lookupType('CDemoStop');
const CDemoStringTables = ProtoProvider.DEMO.lookupType('CDemoStringTables');
const CDemoSyncTick = ProtoProvider.DEMO.lookupType('CDemoSyncTick');
const CDemoUserCmd = ProtoProvider.DEMO.lookupType('CDemoUserCmd');

const demError = new DemoPacketType('DEM_Error', -1, null);
const demStop = new DemoPacketType('DEM_Stop', 0, CDemoStop);
const demFileHeader = new DemoPacketType('DEM_FileHeader', 1, CDemoFileHeader);
const demFileInfo = new DemoPacketType('DEM_FileInfo', 2, CDemoFileInfo);
const demSyncTick = new DemoPacketType('DEM_SyncTick', 3, CDemoSyncTick);
const demSendTables = new DemoPacketType('DEM_SendTables', 4, CDemoSendTables);
const demClassInfo = new DemoPacketType('DEM_ClassInfo', 5, CDemoClassInfo);
const demStringTables = new DemoPacketType('DEM_StringTables', 6, CDemoStringTables);
const demPacket = new DemoPacketType('DEM_Packet', 7, CDemoPacket);
const demSignonPacket = new DemoPacketType('DEM_SignonPacket', 8, CDemoPacket);
const demConsoleCmd = new DemoPacketType('DEM_ConsoleCmd', 9, CDemoConsoleCmd);
const demCustomData = new DemoPacketType('DEM_CustomData', 10, CDemoCustomData);
const demCustomDataCallbacks = new DemoPacketType('DEM_CustomDataCallbacks', 11, CDemoCustomDataCallbacks);
const demUserCmd = new DemoPacketType('DEM_UserCmd', 12, CDemoUserCmd);
const demFullPacket = new DemoPacketType('DEM_FullPacket', 13, CDemoPacket);
const demSaveGame = new DemoPacketType('DEM_SaveGame', 14, CDemoSaveGame);
const demSpawnGroups = new DemoPacketType('DEM_SpawnGroups', 15, CDemoSpawnGroups);
const demAnimationData = new DemoPacketType('DEM_AnimationData', 16, CDemoAnimationData);
const demAnimationHeader = new DemoPacketType('DEM_AnimationHeader', 17, CDemoAnimationHeader);
const demRecovery = new DemoPacketType('DEM_Recovery', 18, CDemoRecovery);

export default DemoPacketType;
