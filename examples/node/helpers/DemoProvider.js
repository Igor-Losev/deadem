import https from 'node:https';

import FileSystem from '#core/FileSystem.js';

const DEMO_FOLDER = FileSystem.getAbsolutePath(import.meta.url, './../../demos');
const S3_BUCKET_URL = 'https://parser-demofiles.s3.us-east-1.amazonaws.com';

class DemoProvider {
    constructor() {

    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async read(demoFile) {
        const exists = DemoProvider.checkFile(demoFile);

        if (exists) {
            return DemoProvider.readFile(demoFile);
        } else {
            return DemoProvider.readS3(demoFile);
        }
    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {boolean}
     */
    static checkFile(demoFile) {
        let exists;

        try {
            const path = getLocalPath(demoFile);

            exists = FileSystem.isFile(path);
        } catch {
            exists = false;
        }

        return exists;
    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async readFile(demoFile) {
        const path = getLocalPath(demoFile);

        return FileSystem.createReadStream(path, { highWaterMark: 256 * 1024 });
    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async readS3(demoFile) {
        return new Promise((resolve, reject) => {
            https.get(`${S3_BUCKET_URL}/${demoFile.getFileName()}`, (response) => {
                if (response.statusCode !== 200) {
                    response.resume();

                    reject(new Error(`Error reading from s3, status code [ ${response.statusCode} ]`));
                } else {
                    resolve(response);
                }
            }).on('error', reject);
        });
    }
}

/**
 * @param {DemoFile} demoFile
 * @returns {string}
 */
function getLocalPath(demoFile) {
    return `${DEMO_FOLDER}/${demoFile.getFileName()}`;
}

export default DemoProvider;
