import fs from 'node:fs/promises';
import path from 'node:path';

import Assert from '../core/Assert.js';

import ProtoSource from '../enums/ProtoSource.js';

/**
 * Downloads the `.proto` files of a game from SteamTracking into its `proto/source`, overwriting the ones that differ.
 */
class ProtoSync {
    /**
     * @constructor
     * @param {ProtoSource} source
     */
    constructor(source) {
        Assert.isTrue(source instanceof ProtoSource);

        /** @private */
        this._source = source;
    }

    /**
     * Downloads every file first, then writes the changed ones; returns their names.
     *
     * @public
     * @returns {Promise<Array<string>>}
     */
    async run() {
        const contents = await Promise.all(this._source.files.map(file => this._download(file)));
        const changed = [ ];

        for (let i = 0; i < contents.length; i++) {
            if (await this._write(this._source.files[i], contents[i])) {
                changed.push(this._source.files[i]);
            }
        }

        return changed;
    }

    /**
     * @private
     * @param {string} file
     * @returns {Promise<Buffer>}
     */
    async _download(file) {
        const url = this._source.getFileUrl(file);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Download failed [ ${url} ]: HTTP ${response.status} ${response.statusText}`);
        }

        return Buffer.from(await response.arrayBuffer());
    }

    /**
     * Writes [content] unless the local file already holds it; returns whether it wrote.
     *
     * @private
     * @param {string} file
     * @param {Buffer} content
     * @returns {Promise<boolean>}
     */
    async _write(file, content) {
        const directory = this._source.workspace.protoSourceDirectory;

        const target = path.join(directory, file);
        const current = await fs.readFile(target).catch(() => null);

        if (current !== null && current.equals(content)) {
            return false;
        }

        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(target, content);

        return true;
    }
}

export default ProtoSync;
