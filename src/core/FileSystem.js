import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import Assert from './Assert.js';

class FileSystem {
    constructor() {

    }

    /**
     * @public
     * @static
     * @param {...*} args
     * @returns {ReadStream}
     */
    static createReadStream(...args) {
        return fs.createReadStream(...args);
    }

    /**
     * @public
     * @static
     * @param {String} path
     * @returns {boolean}
     */
    static isFile(path) {
        let isFile;

        try {
            const stat = fs.statSync(path);

            isFile = stat.isFile();
        } catch {
            isFile = false;
        }

        return isFile;
    }

    /**
     * @public
     * @static
     * @param {String} importMetaUrl
     * @param {String} path
     * @returns {String}
     */
    static getAbsolutePath(importMetaUrl, path) {
        Assert.isTrue(typeof importMetaUrl === 'string');
        Assert.isTrue(typeof path === 'string');

        const __filename = fileURLToPath(importMetaUrl);
        const __dirname = dirname(__filename);

        return join(__dirname, path);
    }

    /**
     * @public
     * @static
     * @param {...any} args
     * @returns {Buffer}
     */
    static readFileSync(...args) {
        return fs.readFileSync(...args);
    }
}

export default FileSystem;
