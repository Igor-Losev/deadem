import Assert from '../core/Assert.js';

import Workspace from './Workspace.js';

const RAW_URL = 'https://raw.githubusercontent.com/SteamTracking';

const registry = new Map();

class ProtoSource {
    /**
     * @constructor
     * @param {string} code
     * @param {Workspace} workspace
     * @param {string} repository
     * @param {Array<string>} files
     */
    constructor(code, workspace, repository, files) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(workspace instanceof Workspace && workspace.game);
        Assert.isTrue(typeof repository === 'string' && repository.length > 0);
        Assert.isTrue(Array.isArray(files) && files.length > 0 && files.every(file => file.endsWith('.proto')));
        Assert.isTrue(!registry.has(workspace));

        /** @private */
        this._code = code;
        /** @private */
        this._workspace = workspace;
        /** @private */
        this._repository = repository;
        /** @private */
        this._files = files;

        registry.set(workspace, this);
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
     * @returns {Workspace}
     */
    get workspace() {
        return this._workspace;
    }

    /**
     * @public
     * @returns {string}
     */
    get repository() {
        return this._repository;
    }

    /**
     * @public
     * @returns {Array<string>}
     */
    get files() {
        return this._files;
    }

    /**
     * @public
     * @param {string} file
     * @returns {string}
     */
    getFileUrl(file) {
        return `${RAW_URL}/${this._repository}/master/Protobufs/${file}`;
    }

    /**
     * @public
     * @static
     * @param {Workspace} workspace
     * @returns {ProtoSource|null}
     */
    static parseByWorkspace(workspace) {
        return registry.get(workspace) || null;
    }

    static get CS2() { return cs2; }
    static get DEADEM() { return deadem; }
    static get DOTA2() { return dota2; }
}

const cs2 = new ProtoSource('CS2', Workspace.CS2, 'GameTracking-CS2', [
    'cs_gameevents.proto',
    'cs_usercmd.proto',
    'cstrike15_gcmessages.proto',
    'cstrike15_usermessages.proto',
    'demo.proto',
    'engine_gcmessages.proto',
    'gameevents.proto',
    'gcsdk_gcmessages.proto',
    'netmessages.proto',
    'network_connection.proto',
    'networkbasetypes.proto',
    'source2_steam_stats.proto',
    'steammessages.proto',
    'te.proto',
    'usercmd.proto',
    'usermessages.proto',
    'valveextensions.proto'
]);

const deadem = new ProtoSource('DEADEM', Workspace.DEADEM, 'GameTracking-Deadlock', [
    'base_gcmessages.proto',
    'base_modifier.proto',
    'citadel_gameevents.proto',
    'citadel_gcmessages_common.proto',
    'citadel_usercmd.proto',
    'citadel_usermessages.proto',
    'demo.proto',
    'gameevents.proto',
    'gcsdk_gcmessages.proto',
    'netmessages.proto',
    'network_connection.proto',
    'networkbasetypes.proto',
    'source2_steam_stats.proto',
    'steammessages.proto',
    'steammessages_steamlearn.steamworkssdk.proto',
    'steammessages_unified_base.steamworkssdk.proto',
    'te.proto',
    'usercmd.proto',
    'usermessages.proto',
    'valveextensions.proto'
]);

const dota2 = new ProtoSource('DOTA2', Workspace.DOTA2, 'GameTracking-Dota2', [
    'base_gcmessages.proto',
    'demo.proto',
    'dota_commonmessages.proto',
    'dota_modifiers.proto',
    'dota_shared_enums.proto',
    'dota_usermessages.proto',
    'events.proto',
    'gameevents.proto',
    'gcsdk_gcmessages.proto',
    'netmessages.proto',
    'network_connection.proto',
    'networkbasetypes.proto',
    'source2_steam_stats.proto',
    'steammessages.proto',
    'steammessages_steamlearn.steamworkssdk.proto',
    'steammessages_unified_base.steamworkssdk.proto',
    'te.proto',
    'usermessages.proto',
    'valveextensions.proto'
]);

export default ProtoSource;
