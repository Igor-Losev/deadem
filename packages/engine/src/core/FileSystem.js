/** @import { Readable, Writable } from 'node:stream' */

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
     * @returns {Readable}
     */
    static createReadStream(...args) {
        // @ts-ignore — forwarding to fs
        return fs.createReadStream(...args);
    }

    /**
     * @public
     * @static
     * @param {...*} args
     * @returns {Writable}
     */
    static createWriteStream(...args) {
        // @ts-ignore — forwarding to fs
        return fs.createWriteStream(...args);
    }

    /**
     * @public
     * @static
     * @param {string} path
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
     * @param {string} importMetaUrl
     * @param {string} path
     * @returns {string}
     */
    static getAbsolutePath(importMetaUrl, path) {
        Assert.isTrue(typeof importMetaUrl === 'string');
        Assert.isTrue(typeof path === 'string');

        const __filename = fileURLToPath(importMetaUrl);
        const __dirname = dirname(__filename);

        return join(__dirname, path);
    }

    /**
     * @overload
     * @param {string} path
     * @param {BufferEncoding} encoding
     * @returns {string}
     */
    /**
     * @overload
     * @param {string} path
     * @returns {Buffer}
     */
    /**
     * @public
     * @static
     * @param {string} path
     * @param {BufferEncoding} [encoding]
     * @returns {string|Buffer}
     */
    static readFileSync(path, encoding) {
        return fs.readFileSync(path, encoding);
    }
}

export default FileSystem;
