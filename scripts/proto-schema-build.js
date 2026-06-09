import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import protobuf from 'protobufjs/light.js';

const DIRECTORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRECTORY_PACKAGES = path.join(DIRECTORY_ROOT, 'packages');
const DIRECTORY_BIN = path.join(DIRECTORY_ROOT, 'node_modules/.bin');

const LOOKUP_TYPE_LITERAL_PATTERN = /\.lookupType\(\s*['"]([^'"]+)['"]\s*\)/g;
const LOOKUP_TYPE_CALL_PATTERN = /\.lookupType\s*\(/g;

const PACKAGE_NAME_ENGINE = 'engine';

function main() {
    const context = { };

    context.package = getPackageArgument(process.argv.slice(2));

    context.directories = { };
    context.directories.proto = getProtoSourceDirectory(context.package);

    context.files = { };
    context.files.output = getOutputFile(context.package);

    context.messages = new Set();
    context.protos = scanProtoFiles(context.directories.proto);

    const bootstrap = [
        getBootstrapFile(PACKAGE_NAME_ENGINE),
        getBootstrapFile(context.package)
    ];

    bootstrap.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');

        const countOfCalls = (content.match(LOOKUP_TYPE_CALL_PATTERN) || []).length;
        const countOfLiterals = (content.match(LOOKUP_TYPE_LITERAL_PATTERN) || []).length;

        if (countOfCalls !== countOfLiterals) {
            throw new Error(`Non-literal lookupType(...) call detected in [ ${filePath} ] - only string literals are supported.`);
        }

        for (const match of content.matchAll(LOOKUP_TYPE_LITERAL_PATTERN)) {
            context.messages.add(match[1].replace(/^\./, ''));
        }
    });

    const messages = Array.from(context.messages).sort((a, b) => a.localeCompare(b));

    context.schema = runPbjs(context.directories.proto, context.protos, messages);

    stripExtensions(context.schema);

    validateSchema(context.schema, messages);

    writeSchema(context.files.output, context.schema);
}

main();

function getBootstrapFile(packageName) {
    return path.join(DIRECTORY_PACKAGES, packageName, 'src/bootstrap/Bootstrap.js');
}

function getOutputFile(packageName) {
    return path.join(DIRECTORY_PACKAGES, packageName, 'proto/compiled/proto.json');
}

function getPackageArgument(args) {
    const argument = args.find((value) => value.startsWith('--package='));

    if (!argument) {
        throw new Error('Missing required argument: --package=<name>');
    }

    return argument.slice('--package='.length);
}

function getProtoSourceDirectory(packageName) {
    return path.join(DIRECTORY_PACKAGES, packageName,  'proto/source');
}


function runPbjs(protoDirectory, protos, messages) {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-schema-'));
    const filter = path.join(temporaryDirectory, 'filter.json');

    try {
        fs.writeFileSync(filter, JSON.stringify({ messageNames: messages }));

        const result = spawnSync('pbjs', [
            '--path', protoDirectory,
            '-t', 'json',
            '--filter', filter,
            ...protos
        ], {
            encoding: 'utf-8',
            env: { ...process.env, PATH: `${DIRECTORY_BIN}${path.delimiter}${process.env.PATH ?? ''}` },
            maxBuffer: 64 * 1024 * 1024,
            shell: process.platform === 'win32'
        });

        if (result.error) {
            throw result.error;
        }

        if (result.stderr) {
            process.stderr.write(result.stderr);
        }

        if (result.status !== 0) {
            throw new Error(`pbjs failed with exit code [ ${result.status} ]`);
        }

        return JSON.parse(result.stdout);
    } finally {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
}

function validateSchema(schema, messages) {
    const root = protobuf.Root.fromJSON(schema);

    messages.forEach((message) => {
        root.lookupType(message);
    });
}

function writeSchema(file, schema) {
    fs.mkdirSync(path.dirname(file), { recursive: true });

    const temporaryFile = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);

    fs.writeFileSync(temporaryFile, `${JSON.stringify(schema, null, 2)}\n`);
    fs.renameSync(temporaryFile, file);
}

function scanProtoFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((entry) => {
            const entryPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                return scanProtoFiles(entryPath);
            }

            return entry.name.endsWith('.proto') ? [ entryPath ] : [ ];
        });
}

function stripExtensions(node) {
    delete node.extensions;

    if (!node.nested) {
        return;
    }

    Object.entries(node.nested).forEach(([ name, child ]) => {
        if (child.extend) {
            delete node.nested[name];
        } else {
            stripExtensions(child);
        }
    });
}
