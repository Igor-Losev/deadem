import https from 'node:https';
import nodePath from 'node:path';

import { Logger } from '@deademx/engine';

import FileSystem from '@deademx/engine/src/core/FileSystem.js';

const logger = Logger.CONSOLE_DEBUG;

const DEFAULT_HIGH_WATER_MARK = 256 * 1024;
const DEMO_ARGUMENT_PREFIX = '--demo=';
const DEMO_FOLDER = FileSystem.getAbsolutePath(import.meta.url, './../../../demos');
const S3_BASE_URL = 'https://deadem.s3.us-east-1.amazonaws.com';

class DemoProvider {
    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async read(demoFile) {
        const path = getLocalPath(demoFile);

        const exists = FileSystem.isFile(path);

        if (exists) {
            logger.debug(`Reading file [ ${path} ] from the file system...`);

            return DemoProvider.readFile(demoFile);
        } else {
            logger.debug(`Couldn't find a file [ ${path} ]. Reading demo [ ${demoFile.getFileName()} ] from S3...`);

            return DemoProvider.readS3(demoFile);
        }
    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async readFile(demoFile) {
        const path = getLocalPath(demoFile);

        return FileSystem.createReadStream(path, { highWaterMark: DEFAULT_HIGH_WATER_MARK });
    }

    /**
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async readS3(demoFile) {
        const url = `${S3_BASE_URL}/${demoFile.game.code}/demos/${demoFile.getFileName()}`;

        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    response.resume();

                    reject(new Error(`Error reading from s3, status code [ ${response.statusCode} ]`));
                } else {
                    resolve(response);
                }
            }).on('error', reject);
        });
    }

    /**
     * Reads the demo passed via the `--demo=<path>` CLI argument, if present;
     * otherwise falls back to the bundled [demoFile] (local file system or S3).
     *
     * @public
     * @static
     * @param {DemoFile} demoFile
     * @returns {Promise<ReadableStream>}
     */
    static async resolve(demoFile) {
        const argument = process.argv.find(arg => arg.startsWith(DEMO_ARGUMENT_PREFIX));

        if (!argument) {
            return DemoProvider.read(demoFile);
        }

        const file = nodePath.resolve(process.cwd(), argument.slice(DEMO_ARGUMENT_PREFIX.length));

        if (!FileSystem.isFile(file)) {
            throw new Error(`Demo file not found [ ${file} ]`);
        }

        logger.debug(`Reading file [ ${file} ] from the --demo argument...`);

        return FileSystem.createReadStream(file, { highWaterMark: DEFAULT_HIGH_WATER_MARK });
    }
}

/**
 * @param {DemoFile} demoFile
 * @returns {string}
 */
function getLocalPath(demoFile) {
    return `${DEMO_FOLDER}/${demoFile.game.code}/${demoFile.getFileName()}`;
}

export default DemoProvider;
