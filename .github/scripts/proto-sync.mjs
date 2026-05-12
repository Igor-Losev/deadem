#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');

const UPSTREAM_BASE = 'https://raw.githubusercontent.com/SteamDatabase/Protobufs/master';

const ENGINE_FILES = [
    'base_gcmessages.proto',
    'demo.proto',
    'gameevents.proto',
    'gcsdk_gcmessages.proto',
    'netmessages.proto',
    'network_connection.proto',
    'networkbasetypes.proto',
    'source2_steam_stats.proto',
    'steammessages.proto',
    'steammessages_steamlearn.steamworkssdk.proto',
    'steammessages_unified_base.steamworkssdk.proto',
    'te.proto',
    'usermessages.proto',
    'valveextensions.proto'
];

const TARGETS = {
    deadem: {
        upstreamDir: 'deadlock',
        files: [
            { upstream: 'base_modifier.proto', local: 'packages/deadem/proto/source/base_modifier.proto' },
            { upstream: 'citadel_gameevents.proto', local: 'packages/deadem/proto/source/citadel_gameevents.proto' },
            { upstream: 'citadel_gcmessages_common.proto', local: 'packages/deadem/proto/source/citadel_gcmessages_common.proto' },
            { upstream: 'citadel_usermessages.proto', local: 'packages/deadem/proto/source/citadel_usermessages.proto' },
            ...ENGINE_FILES.map((f) => ({ upstream: f, local: `packages/engine/proto/source/${f}` }))
        ]
    },
    dota2: {
        upstreamDir: 'dota2',
        files: [
            { upstream: 'dota_commonmessages.proto', local: 'packages/dota2/proto/source/dota_commonmessages.proto' },
            { upstream: 'dota_modifiers.proto', local: 'packages/dota2/proto/source/dota_modifiers.proto' },
            { upstream: 'dota_shared_enums.proto', local: 'packages/dota2/proto/source/dota_shared_enums.proto' },
            { upstream: 'dota_usermessages.proto', local: 'packages/dota2/proto/source/dota_usermessages.proto' }
        ]
    }
};

const target = process.argv[2];
const config = TARGETS[target];

if (!config) {
    console.error(`Usage: node proto-sync.mjs <${Object.keys(TARGETS).join('|')}>`);

    process.exit(1);
}

async function fetchProto({ upstream, local }) {
    const url = `${UPSTREAM_BASE}/${config.upstreamDir}/${upstream}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status} ${response.statusText}`);
    }

    return { local, remote: Buffer.from(await response.arrayBuffer()) };
}

console.log(`Syncing ${config.files.length} file(s) from ${config.upstreamDir}/ ...`);

const downloads = await Promise.all(config.files.map(fetchProto));

const changed = [ ];

for (const { local, remote } of downloads) {
    const localPath = resolve(REPO_ROOT, local);
    const current = existsSync(localPath) ? await readFile(localPath) : null;

    if (current !== null && current.equals(remote)) {
        continue;
    }

    await mkdir(dirname(localPath), { recursive: true });
    await writeFile(localPath, remote);

    changed.push(local);

    console.log(`Updated ${local}`);
}

console.log(`\n${changed.length} of ${downloads.length} file(s) changed`);
