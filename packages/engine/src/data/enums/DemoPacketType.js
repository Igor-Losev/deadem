import Assert from '../../core/Assert.js';

const registries = new WeakMap();

class DemoPacketType {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     * @param {boolean} heavy
     * @param {boolean} bootstrap
     * @param {string|null} [protoName=null]
     */
    constructor(code, id, heavy, bootstrap, protoName = null) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(typeof heavy === 'boolean');
        Assert.isTrue(typeof bootstrap === 'boolean');

        /** @private */
        this._code = code;
        /** @private */
        this._id = id;
        /** @private */
        this._heavy = heavy;
        /** @private */
        this._bootstrap = bootstrap;
        /** @private */
        this._protoName = protoName;

        const owner = new.target;

        let registry = registries.get(owner) || null;

        if (registry === null) {
            registry = new Map();

            registries.set(owner, registry);
        }

        registry.set(id, this);
    }

    /**
     * @public
     * @returns {string}
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
     * @returns {string|null}
     */
    get protoName() {
        return this._protoName;
    }

    /**
     * @public
     * @returns {Array<DemoPacketType>}
     */
    static getAll() {
        const members = new Map();

        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            for (const [ id, member ] of registry) {
                if (!members.has(id)) {
                    members.set(id, member);
                }
            }
        }

        return Array.from(members.values());
    }

    /**
     * @public
     * @param {number} id
     * @returns {DemoPacketType|null}
     */
    static getById(id) {
        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            const member = registry.get(id) || null;

            if (member !== null) {
                return member;
            }
        }

        return null;
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

const demError = new DemoPacketType('DEM_Error', -1, false, false, null);
const demStop = new DemoPacketType('DEM_Stop', 0, false, false, 'CDemoStop');
const demFileHeader = new DemoPacketType('DEM_FileHeader', 1, false, true, 'CDemoFileHeader');
const demFileInfo = new DemoPacketType('DEM_FileInfo', 2, false, false, 'CDemoFileInfo');
const demSyncTick = new DemoPacketType('DEM_SyncTick', 3, false, false, 'CDemoSyncTick');
const demSendTables = new DemoPacketType('DEM_SendTables', 4, false, true, 'CDemoSendTables');
const demClassInfo = new DemoPacketType('DEM_ClassInfo', 5, false, true, 'CDemoClassInfo');
const demStringTables = new DemoPacketType('DEM_StringTables', 6, false, true, 'CDemoStringTables');
const demPacket = new DemoPacketType('DEM_Packet', 7, true, false, 'CDemoPacket');
const demSignonPacket = new DemoPacketType('DEM_SignonPacket', 8, true, true, 'CDemoPacket');
const demConsoleCmd = new DemoPacketType('DEM_ConsoleCmd', 9, false, false, 'CDemoConsoleCmd');
const demCustomData = new DemoPacketType('DEM_CustomData', 10, false, false, 'CDemoCustomData');
const demCustomDataCallbacks = new DemoPacketType('DEM_CustomDataCallbacks', 11, false, false, 'CDemoCustomDataCallbacks');
const demUserCmd = new DemoPacketType('DEM_UserCmd', 12, false, false, 'CDemoUserCmd');
const demFullPacket = new DemoPacketType('DEM_FullPacket', 13, true, false, 'CDemoFullPacket');
const demSaveGame = new DemoPacketType('DEM_SaveGame', 14, false, false, 'CDemoSaveGame');
const demSpawnGroups = new DemoPacketType('DEM_SpawnGroups', 15, false, false, 'CDemoSpawnGroups');
const demAnimationData = new DemoPacketType('DEM_AnimationData', 16, false, false, 'CDemoAnimationData');
const demAnimationHeader = new DemoPacketType('DEM_AnimationHeader', 17, false, false, 'CDemoAnimationHeader');
const demRecovery = new DemoPacketType('DEM_Recovery', 18, false, false, 'CDemoRecovery');

export default DemoPacketType;
