import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LITERAL_PATTERN = /\.lookupType\(\s*['"]([^'"]+)['"]\s*\)/g;
const CALL_PATTERN = /\.lookupType\s*\(/g;

/**
 * Generates a minimized protobuf JSON schema for the current package by
 * filtering pbjs output down to the message types actually referenced at
 * runtime, and stripping extension metadata unused by the decoder.
 *
 * Discovers message types by scanning {@code lookupType('...')} calls in:
 *   - {@code <repo>/packages/engine/src/bootstrap/Bootstrap.js}
 *   - {@code <pkg>/src/bootstrap/Bootstrap.js}
 *
 * Intended to be invoked from a package directory (i.e. with
 * {@code process.cwd()} pointing at the package).
 */
class ProtoSchemaBuilder {
    /**
     * @public
     * @static
     */
    static run() {
        const packageDirectory = process.cwd();
        const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

        const bootstrapFiles = [
            path.join(repositoryDirectory, 'packages/engine/src/bootstrap/Bootstrap.js'),
            path.join(packageDirectory, 'src/bootstrap/Bootstrap.js')
        ];

        const protoSourceDirectory = path.join(packageDirectory, 'proto/source');
        const outputFile = path.join(packageDirectory, 'proto/compiled/proto.json');
        const filterFile = path.join(os.tmpdir(), `proto-schema-filter-${process.pid}.json`);

        const messageNames = ProtoSchemaBuilder._collectMessageNames(bootstrapFiles);

        try {
            ProtoSchemaBuilder._writeFilterFile(filterFile, messageNames);

            fs.mkdirSync(path.dirname(outputFile), { recursive: true });

            ProtoSchemaBuilder._runPbjs(filterFile, outputFile, protoSourceDirectory, packageDirectory);
            ProtoSchemaBuilder._stripExtensions(outputFile);
        } finally {
            fs.rmSync(filterFile, { force: true });
        }
    }

    /**
     * @private
     * @static
     * @param {Array<String>} files
     * @returns {Array<String>}
     */
    static _collectMessageNames(files) {
        const messageNames = new Set();

        for (const file of files) {
            const source = fs.readFileSync(file, 'utf-8');

            const literalCount = (source.match(LITERAL_PATTERN) || []).length;
            const callCount = (source.match(CALL_PATTERN) || []).length;

            if (literalCount !== callCount) {
                throw new Error(`Non-literal lookupType(...) call detected in [ ${file} ] - only string literals are supported.`);
            }

            for (const match of source.matchAll(LITERAL_PATTERN)) {
                messageNames.add(match[1].replace(/^\./, ''));
            }
        }

        return Array.from(messageNames).sort();
    }

    /**
     * @private
     * @static
     * @param {String} directory
     * @returns {Array<String>}
     */
    static _listProtoFiles(directory) {
        const files = [ ];
        const entries = fs.readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name));

        for (const entry of entries) {
            const entryPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                files.push(...ProtoSchemaBuilder._listProtoFiles(entryPath));
            } else if (entry.name.endsWith('.proto')) {
                files.push(entryPath);
            }
        }

        return files;
    }

    /**
     * @private
     * @static
     * @param {String} filterFile
     * @param {String} outputFile
     * @param {String} sourceDirectory
     * @param {String} packageDirectory
     */
    static _runPbjs(filterFile, outputFile, sourceDirectory, packageDirectory) {
        const result = spawnSync('pbjs', [
            '--path', sourceDirectory,
            '-t', 'json',
            '--filter', filterFile,
            '-o', outputFile,
            ...ProtoSchemaBuilder._listProtoFiles(sourceDirectory)
        ], {
            cwd: packageDirectory,
            shell: process.platform === 'win32',
            stdio: 'inherit'
        });

        if (result.status !== 0) {
            throw new Error(`pbjs failed with exit code [ ${result.status} ]`);
        }
    }

    /**
     * @private
     * @static
     * @param {String} file
     */
    static _stripExtensions(file) {
        const schema = JSON.parse(fs.readFileSync(file, 'utf-8'));

        ProtoSchemaBuilder._stripExtensionsNode(schema);

        fs.writeFileSync(file, JSON.stringify(schema, null, 2));
    }

    /**
     * @private
     * @static
     * @param {Object} node
     */
    static _stripExtensionsNode(node) {
        delete node.extensions;

        if (!node.nested) {
            return;
        }

        for (const [ name, child ] of Object.entries(node.nested)) {
            if (child.extend) {
                delete node.nested[name];
            } else {
                ProtoSchemaBuilder._stripExtensionsNode(child);
            }
        }
    }

    /**
     * @private
     * @static
     * @param {String} file
     * @param {Array<String>} messageNames
     */
    static _writeFilterFile(file, messageNames) {
        fs.writeFileSync(file, JSON.stringify({ messageNames }));
    }
}

ProtoSchemaBuilder.run();
