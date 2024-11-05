'use strict';

const ProtoProvider = require('./../../providers/ProtoProvider.instance');

const Enum = require('./Enum');

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class DemoCommandType extends Enum {
    /**
     * @constructor
     * @param {String} code
     * @param {Number} id
     * @param {*|null} proto
     */
    constructor(code, id, proto) {
        super(code, code);

        this._id = id;
        this._proto = proto;

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    get id() {
        return this._id;
    }

    get proto() {
        return this._proto;
    }

    /**
     * @public
     * @static
     * @param {String} code
     * @returns {DemoCommandType|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @param {Number} id
     * @returns {DemoCommandType|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    static get DEM_ERROR() {
        return demError;
    }

    static get DEM_STOP() {
        return demStop;
    }

    static get DEM_FILE_HEADER() {
        return demFileHeader;
    }

    static get DEM_FILE_INFO() {
        return demFileInfo;
    }

    static get DEM_SYNC_TICK() {
        return demSyncTick;
    }

    static get DEM_SEND_TABLES() {
        return demSendTables;
    }

    static get DEM_CLASS_INFO() {
        return demClassInfo;
    }

    static get DEM_STRING_TABLES() {
        return demStringTables;
    }

    static get DEM_PACKET() {
        return demPacket;
    }

    static get DEM_SIGNON_PACKET() {
        return demSignonPacket;
    }

    static get DEM_CONSOLE_CMD() {
        return demConsoleCmd;
    }

    static get DEM_CUSTOM_DATA() {
        return demCustomData;
    }

    static get DEM_CUSTOM_DATA_CALLBACKS() {
        return demCustomDataCallbacks;
    }

    static get DEM_USER_CMD() {
        return demUserCmd;
    }

    static get DEM_FULL_PACKET() {
        return demFullPacket;
    }

    static get DEM_SAVE_GAME() {
        return demSaveGame;
    }

    static get DEM_SPAWN_GROUPS() {
        return demSpawnGroups;
    }

    static get DEM_ANIMATION_DATA() {
        return demAnimationData;
    }

    static get DEM_ANIMATION_HEADER() {
        return demAnimationHeader;
    }
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
const CDemoSaveGame = ProtoProvider.DEMO.lookupType('CDemoSaveGame');
const CDemoSendTables = ProtoProvider.DEMO.lookupType('CDemoSendTables');
const CDemoSpawnGroups = ProtoProvider.DEMO.lookupType('CDemoSpawnGroups');
const CDemoStop = ProtoProvider.DEMO.lookupType('CDemoStop');
const CDemoStringTables = ProtoProvider.DEMO.lookupType('CDemoStringTables');
const CDemoSyncTick = ProtoProvider.DEMO.lookupType('CDemoSyncTick');
const CDemoUserCmd = ProtoProvider.DEMO.lookupType('CDemoUserCmd');

const demError = new DemoCommandType('DEM_Error', -1, null);
const demStop = new DemoCommandType('DEM_Stop', 0, CDemoStop);
const demFileHeader = new DemoCommandType('DEM_FileHeader', 1, CDemoFileHeader);
const demFileInfo = new DemoCommandType('DEM_FileInfo', 2, CDemoFileInfo);
const demSyncTick = new DemoCommandType('DEM_SyncTick', 3, CDemoSyncTick);
const demSendTables = new DemoCommandType('DEM_SendTables', 4, CDemoSendTables);
const demClassInfo = new DemoCommandType('DEM_ClassInfo', 5, CDemoClassInfo);
const demStringTables = new DemoCommandType('DEM_StringTables', 6, CDemoStringTables);
const demPacket = new DemoCommandType('DEM_Packet', 7, CDemoPacket);
const demSignonPacket = new DemoCommandType('DEM_SignonPacket', 8, CDemoPacket);
const demConsoleCmd = new DemoCommandType('DEM_ConsoleCmd', 9, CDemoConsoleCmd);
const demCustomData = new DemoCommandType('DEM_CustomData', 10, CDemoCustomData);
const demCustomDataCallbacks = new DemoCommandType('DEM_CustomDataCallbacks', 11, CDemoCustomDataCallbacks);
const demUserCmd = new DemoCommandType('DEM_UserCmd', 12, CDemoUserCmd);
const demFullPacket = new DemoCommandType('DEM_FullPacket', 13, CDemoPacket);
const demSaveGame = new DemoCommandType('DEM_SaveGame', 14, CDemoSaveGame);
const demSpawnGroups = new DemoCommandType('DEM_SpawnGroups', 15, CDemoSpawnGroups);
const demAnimationData = new DemoCommandType('DEM_AnimationData', 16, CDemoAnimationData);
const demAnimationHeader = new DemoCommandType('DEM_AnimationHeader', 17, CDemoAnimationHeader);

module.exports = DemoCommandType;
