import Assert from '../core/Assert.js';

import Workspace from '../enums/Workspace.js';

/**
 * Command line arguments of the tools scripts.
 */
class ScriptArguments {
    /**
     * @constructor
     * @param {Array<string>} values
     */
    constructor(values) {
        Assert.isTrue(Array.isArray(values));

        /** @private */
        this._values = values;
    }

    /**
     * Game workspaces named by the positional arguments, all games when none given; fails on an unknown folder.
     *
     * @public
     * @returns {Array<Workspace>}
     */
    getWorkspaces() {
        if (this._values.length === 0) {
            return Workspace.getGames();
        }

        return this._values.map((folder) => {
            const workspace = Workspace.parseByFolder(folder);

            if (workspace === null || !workspace.game) {
                throw new Error(`Unknown game workspace [ ${folder} ], expected one of [ ${ScriptArguments._getGameFolders()} ]`);
            }

            return workspace;
        });
    }

    /**
     * @private
     * @static
     * @returns {string}
     */
    static _getGameFolders() {
        return Workspace.getGames().map(workspace => workspace.folder).join(', ');
    }
}

export default ScriptArguments;
