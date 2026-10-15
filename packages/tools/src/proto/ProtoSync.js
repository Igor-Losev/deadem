import fs from 'node:fs/promises';
import path from 'node:path';

import Assert from '../core/Assert.js';

import ProtoSource from '../enums/ProtoSource.js';

import ProtoNormalizer from './ProtoNormalizer.js';

const WELL_KNOWN_TYPES_DIRECTORY = 'google/protobuf/';

/**
 * @typedef {object} ProtoSyncResult
 * @property {Array<string>} changed - Written files.
 * @property {Array<string>} unlisted - Imported files missing from `ProtoSource.files`.
 */

/**
 * Syncs the `.proto` files of a game with SteamTracking.
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
     * Downloads the .proto files, normalizes them and writes the changed ones.
     *
     * @public
     * @returns {Promise<ProtoSyncResult>}
     */
    async run() {
        const files = await this._downloadAll();

        const changed = [ ];

        for (const [ file, text ] of files) {
            if (await this._writeIfChanged(file, ProtoNormalizer.normalize(file, text))) {
                changed.push(file);
            }
        }

        return {
            changed,
            unlisted: [ ...files.keys() ].filter(file => !this._source.files.includes(file))
        };
    }

    /**
     * Downloads a single file.
     *
     * @private
     * @param {string} file
     * @returns {Promise<string>}
     */
    async _download(file) {
        const url = this._source.getFileUrl(file);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Download failed [ ${url} ]: HTTP ${response.status} ${response.statusText}`);
        }

        return response.text();
    }

    /**
     * Downloads the listed files and, recursively, everything they import, except the well-known types:
     * `buf` provides them.
     *
     * @private
     * @returns {Promise<Map<string, string>>}
     */
    async _downloadAll() {
        const files = new Map();

        let queue = [ ...this._source.files ];

        while (queue.length > 0) {
            const contents = await Promise.all(queue.map(file => this._download(file)));
            const imports = new Set();

            queue.forEach((file, index) => files.set(file, contents[index]));

            for (const text of contents) {
                for (const file of ProtoNormalizer.getImports(text)) {
                    if (!file.startsWith(WELL_KNOWN_TYPES_DIRECTORY) && !files.has(file)) {
                        imports.add(file);
                    }
                }
            }

            queue = [ ...imports ];
        }

        return files;
    }

    /**
     * Writes the file if its content differs.
     *
     * @private
     * @param {string} file
     * @param {string} text
     * @returns {Promise<boolean>} - `true` if the file has changed.
     */
    async _writeIfChanged(file, text) {
        const directory = this._source.workspace.protoSourceDirectory;

        const target = path.join(directory, file);
        const current = await fs.readFile(target, 'utf8').catch(() => null);

        if (current === text) {
            return false;
        }

        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(target, text);

        return true;
    }
}

export default ProtoSync;
