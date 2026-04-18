import Assert from '#core/Assert.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class DemoPacketType {
    /**
     * @constructor
     * @param {String} code
     * @param {number} id
     * @param {*|null} proto
     * @param {boolean} heavy
     * @param {boolean} bootstrap
     */
    constructor(code, id, proto, heavy, bootstrap) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(typeof heavy === 'boolean');
        Assert.isTrue(typeof bootstrap === 'boolean');

        this._code = code;
        this._id = id;
        this._proto = proto;
        this._heavy = heavy;
        this._bootstrap = bootstrap;

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
     * @returns {protobuf.Type}
     */
    get proto() {
        return this._proto;
    }

    /**
     * @public
     * @param {protobuf.Type} value
     */
    set proto(value) {
        this._proto = value;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get bootstrap() {
        return this._bootstrap;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get heavy() {
        return this._heavy;
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

const demError = new DemoPacketType('DEM_Error', -1, null, false, false);
const demStop = new DemoPacketType('DEM_Stop', 0, null, false, false);
const demFileHeader = new DemoPacketType('DEM_FileHeader', 1, null, false, false);
const demFileInfo = new DemoPacketType('DEM_FileInfo', 2, null, false, false);
const demSyncTick = new DemoPacketType('DEM_SyncTick', 3, null, false, false);
const demSendTables = new DemoPacketType('DEM_SendTables', 4, null, false, true);
const demClassInfo = new DemoPacketType('DEM_ClassInfo', 5, null, false, true);
const demStringTables = new DemoPacketType('DEM_StringTables', 6, null, false, true);
const demPacket = new DemoPacketType('DEM_Packet', 7, null, true, false);
const demSignonPacket = new DemoPacketType('DEM_SignonPacket', 8, null, true, true);
const demConsoleCmd = new DemoPacketType('DEM_ConsoleCmd', 9, null, false, false);
const demCustomData = new DemoPacketType('DEM_CustomData', 10, null, false, false);
const demCustomDataCallbacks = new DemoPacketType('DEM_CustomDataCallbacks', 11, null, false, false);
const demUserCmd = new DemoPacketType('DEM_UserCmd', 12, null, false, false);
const demFullPacket = new DemoPacketType('DEM_FullPacket', 13, null, true, false);
const demSaveGame = new DemoPacketType('DEM_SaveGame', 14, null, false, false);
const demSpawnGroups = new DemoPacketType('DEM_SpawnGroups', 15, null, false, false);
const demAnimationData = new DemoPacketType('DEM_AnimationData', 16, null, false, false);
const demAnimationHeader = new DemoPacketType('DEM_AnimationHeader', 17, null, false, false);
const demRecovery = new DemoPacketType('DEM_Recovery', 18, null, false, false);

export default DemoPacketType;
