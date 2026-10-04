import path from 'node:path';

import Assert from '../core/Assert.js';

const PACKAGES_DIRECTORY = path.resolve(import.meta.dirname, '../../..');

const ENUMS_DIRECTORY = 'src/data/enums';
const PROTO_SOURCE_DIRECTORY = 'proto/source';
const PROTO_GENERATED_DIRECTORY = 'proto/generated';

const registry = new Map();

class Workspace {
    /**
     * @constructor
     * @param {string} code
     * @param {string} folder
     * @param {boolean} game
     */
    constructor(code, folder, game) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof folder === 'string' && folder.length > 0);
        Assert.isTrue(typeof game === 'boolean');
        Assert.isTrue(!registry.has(folder));

        const directory = path.join(PACKAGES_DIRECTORY, folder);

        /** @private */
        this._code = code;
        /** @private */
        this._folder = folder;
        /** @private */
        this._game = game;
        /** @private */
        this._enumsDirectory = path.join(directory, ENUMS_DIRECTORY);
        /** @private */
        this._protoSourceDirectory = path.join(directory, PROTO_SOURCE_DIRECTORY);
        /** @private */
        this._protoGeneratedDirectory = path.join(directory, PROTO_GENERATED_DIRECTORY);

        registry.set(folder, this);
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
     * @returns {string}
     */
    get folder() {
        return this._folder;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get game() {
        return this._game;
    }

    /**
     * @public
     * @returns {string}
     */
    get protoSourceDirectory() {
        return this._protoSourceDirectory;
    }

    /**
     * @public
     * @returns {string}
     */
    get protoGeneratedDirectory() {
        return this._protoGeneratedDirectory;
    }

    /**
     * @public
     * @param {string} file
     * @returns {string}
     */
    getEnumFile(file) {
        return path.join(this._enumsDirectory, file);
    }

    /**
     * @public
     * @static
     * @returns {Array<Workspace>}
     */
    static getGames() {
        return Array.from(registry.values()).filter(workspace => workspace.game);
    }

    /**
     * @public
     * @static
     * @param {string} folder
     * @returns {Workspace|null}
     */
    static parseByFolder(folder) {
        return registry.get(folder) || null;
    }

    static get ENGINE() { return engine; }
    static get CS2() { return cs2; }
    static get DEADEM() { return deadem; }
    static get DOTA2() { return dota2; }
}

const engine = new Workspace('ENGINE', 'engine', false);
const cs2 = new Workspace('CS2', 'cs2', true);
const deadem = new Workspace('DEADEM', 'deadem', true);
const dota2 = new Workspace('DOTA2', 'dota2', true);

export default Workspace;
