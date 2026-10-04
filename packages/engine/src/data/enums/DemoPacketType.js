import Assert from '../../core/Assert.js';

const registries = new WeakMap();

class DemoPacketType {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     * @param {string|null} protoName
     * @param {boolean} heavy
     * @param {boolean} bootstrap
     */
    constructor(code, id, protoName, heavy, bootstrap) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(protoName === null || (typeof protoName === 'string' && protoName.length > 0));
        Assert.isTrue(typeof heavy === 'boolean');
        Assert.isTrue(typeof bootstrap === 'boolean');

        /** @private */
        this._code = code;
        /** @private */
        this._id = id;
        /** @private */
        this._protoName = protoName;
        /** @private */
        this._heavy = heavy;
        /** @private */
        this._bootstrap = bootstrap;

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
     * @returns {string|null}
     */
    get protoName() {
        return this._protoName;
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
     * @returns {boolean}
     */
    get bootstrap() {
        return this._bootstrap;
    }

    /**
     * @public
     * @static
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
     * @static
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

const demError = new DemoPacketType('DEM_Error', -1, null, false, false);
const demStop = new DemoPacketType('DEM_Stop', 0, 'CDemoStop', false, false);
const demFileHeader = new DemoPacketType('DEM_FileHeader', 1, 'CDemoFileHeader', false, true);
const demFileInfo = new DemoPacketType('DEM_FileInfo', 2, 'CDemoFileInfo', false, false);
const demSyncTick = new DemoPacketType('DEM_SyncTick', 3, 'CDemoSyncTick', false, false);
const demSendTables = new DemoPacketType('DEM_SendTables', 4, 'CDemoSendTables', false, true);
const demClassInfo = new DemoPacketType('DEM_ClassInfo', 5, 'CDemoClassInfo', false, true);
const demStringTables = new DemoPacketType('DEM_StringTables', 6, 'CDemoStringTables', false, true);
const demPacket = new DemoPacketType('DEM_Packet', 7, 'CDemoPacket', true, false);
const demSignonPacket = new DemoPacketType('DEM_SignonPacket', 8, 'CDemoPacket', true, true);
const demConsoleCmd = new DemoPacketType('DEM_ConsoleCmd', 9, 'CDemoConsoleCmd', false, false);
const demCustomData = new DemoPacketType('DEM_CustomData', 10, 'CDemoCustomData', false, false);
const demCustomDataCallbacks = new DemoPacketType('DEM_CustomDataCallbacks', 11, 'CDemoCustomDataCallbacks', false, false);
const demUserCmd = new DemoPacketType('DEM_UserCmd', 12, 'CDemoUserCmd', false, false);
const demFullPacket = new DemoPacketType('DEM_FullPacket', 13, 'CDemoFullPacket', true, false);
const demSaveGame = new DemoPacketType('DEM_SaveGame', 14, 'CDemoSaveGame', false, false);
const demSpawnGroups = new DemoPacketType('DEM_SpawnGroups', 15, 'CDemoSpawnGroups', false, false);
const demAnimationData = new DemoPacketType('DEM_AnimationData', 16, 'CDemoAnimationData', false, false);
const demAnimationHeader = new DemoPacketType('DEM_AnimationHeader', 17, 'CDemoAnimationHeader', false, false);
const demRecovery = new DemoPacketType('DEM_Recovery', 18, 'CDemoRecovery', false, false);

export default DemoPacketType;
