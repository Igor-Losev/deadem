import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import Assert from '../core/Assert.js';

const CACHE_KEY_LENGTH = 16;

/**
 * Demos of the CI replay regression. The list has one name per line.
 */
class DemoFixtures {
    /**
     * @constructor
     * @param {string} list
     */
    constructor(list) {
        Assert.isTrue(typeof list === 'string');

        /** @private */
        this._list = list;
        /** @private */
        this._names = list.split('\n').filter(name => name.length > 0);
    }

    /**
     * First 16 hex characters of the SHA-256 of the list.
     *
     * @public
     * @returns {string}
     */
    getCacheKey() {
        return crypto.createHash('sha256').update(this._list).digest('hex').slice(0, CACHE_KEY_LENGTH);
    }

    /**
     * Names separated by spaces, for the `--matches` argument.
     *
     * @public
     * @returns {string}
     */
    getMatches() {
        return this._names.join(' ');
    }

    /**
     * Downloads missing demos one by one.
     *
     * @public
     * @param {string} directory
     * @param {string} cdnPrefix
     * @returns {Promise<void>}
     */
    async download(directory, cdnPrefix) {
        await fs.mkdir(directory, { recursive: true });

        for (const name of this._names) {
            const file = `${name}.dem`;
            const target = path.join(directory, file);

            if (await DemoFixtures._isFile(target)) {
                console.log(`Using cached [ ${file} ]`);

                continue;
            }

            console.log(`Downloading [ ${file} ]`);

            await DemoFixtures._downloadFile(`${cdnPrefix}/${file}`, target);
        }
    }

    /**
     * @private
     * @static
     * @param {string} url
     * @param {string} target
     * @returns {Promise<void>}
     */
    static async _downloadFile(url, target) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Download failed [ ${url} ]: HTTP ${response.status} ${response.statusText}`);
        }

        await fs.writeFile(target, response.body);
    }

    /**
     * @private
     * @static
     * @param {string} target
     * @returns {Promise<boolean>}
     */
    static async _isFile(target) {
        return fs.stat(target).then(stats => stats.isFile(), () => false);
    }
}

export default DemoFixtures;
