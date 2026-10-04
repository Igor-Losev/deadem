import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import Assert from '../core/Assert.js';

import Workspace from '../enums/Workspace.js';

const DECODER_REFERENCE_PATTERN = /\.getDecoder\(\s*['"]([^'"]+)['"]\s*\)/g;

const ENUM_FILES = [ 'DemoPacketType.js', 'MessagePacketType.js', 'StringTableType.js' ];

/**
 * Message names that a game decodes.
 */
class MessageRegistry {
    /**
     * Message names from the enums and Bootstraps of the engine and the game, sorted.
     *
     * @public
     * @static
     * @param {Workspace} workspace
     * @returns {Promise<Array<string>>}
     */
    static async collect(workspace) {
        Assert.isTrue(workspace instanceof Workspace && workspace.game);

        const names = [
            ...await MessageRegistry._collectFromEnums(Workspace.ENGINE),
            ...await MessageRegistry._collectFromEnums(workspace),
            ...MessageRegistry._collectFromBootstrap(Workspace.ENGINE),
            ...MessageRegistry._collectFromBootstrap(workspace)
        ];

        return Array.from(new Set(names)).sort();
    }

    /**
     * @private
     * @static
     * @param {Workspace} workspace
     * @returns {Promise<Array<string>>}
     */
    static async _collectFromEnums(workspace) {
        const names = [ ];

        for (const file of ENUM_FILES) {
            const enumFile = workspace.getEnumFile(file);

            if (!fs.existsSync(enumFile)) {
                continue;
            }

            const { default: enumType } = await import(pathToFileURL(enumFile).href);

            for (const member of enumType.getAll()) {
                if (member.protoName !== null) {
                    names.push(member.protoName);
                }
            }
        }

        return names;
    }

    /**
     * @private
     * @static
     * @param {Workspace} workspace
     * @returns {Array<string>}
     */
    static _collectFromBootstrap(workspace) {
        const bootstrap = fs.readFileSync(workspace.bootstrapFile, 'utf-8');

        return Array.from(bootstrap.matchAll(DECODER_REFERENCE_PATTERN), match => match[1]);
    }
}

export default MessageRegistry;
