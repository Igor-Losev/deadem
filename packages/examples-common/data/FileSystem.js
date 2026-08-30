import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

class FileSystem {
    constructor() {

    }

    /**
     * @public
     * @static
     * @param {...*} args
     * @returns {Stream.Readable}
     */
    static createReadStream(...args) {
        return fs.createReadStream(...args);
    }

    /**
     * @public
     * @static
     * @param {...*} args
     * @returns {Stream.Writable}
     */
    static createWriteStream(...args) {
        return fs.createWriteStream(...args);
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
        const __filename = fileURLToPath(importMetaUrl);
        const __dirname = dirname(__filename);

        return join(__dirname, path);
    }
}

export default FileSystem;
