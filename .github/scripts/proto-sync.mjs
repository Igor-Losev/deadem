#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');

const TARGETS = {
    deadem: {
        upstream: 'https://raw.githubusercontent.com/SteamTracking/GameTracking-Deadlock/master/Protobufs',
        localDir: 'packages/deadem/proto/source',
        files: [
            'base_gcmessages.proto',
            'base_modifier.proto',
            'citadel_gameevents.proto',
            'citadel_gcmessages_common.proto',
            'citadel_usermessages.proto',
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
        ]
    },
    dota2: {
        upstream: 'https://raw.githubusercontent.com/SteamTracking/GameTracking-Dota2/master/Protobufs',
        localDir: 'packages/dota2/proto/source',
        files: [
            'base_gcmessages.proto',
            'demo.proto',
            'dota_commonmessages.proto',
            'dota_modifiers.proto',
            'dota_shared_enums.proto',
            'dota_usermessages.proto',
            'events.proto',
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
        ]
    },
    cs2: {
        upstream: 'https://raw.githubusercontent.com/SteamTracking/GameTracking-CS2/master/Protobufs',
        localDir: 'packages/cs2/proto/source',
        files: [
            'cs_gameevents.proto',
            'cstrike15_gcmessages.proto',
            'cstrike15_usermessages.proto',
            'demo.proto',
            'engine_gcmessages.proto',
            'gameevents.proto',
            'gcsdk_gcmessages.proto',
            'netmessages.proto',
            'network_connection.proto',
            'networkbasetypes.proto',
            'source2_steam_stats.proto',
            'steammessages.proto',
            'te.proto',
            'usermessages.proto',
            'valveextensions.proto'
        ]
    }
};

const target = process.argv[2];
const config = TARGETS[target];

if (!config) {
    console.error(`Usage: node proto-sync.mjs <${Object.keys(TARGETS).join('|')}>`);

    process.exit(1);
}

async function fetchProto(file) {
    const url = `${config.upstream}/${file}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status} ${response.statusText}`);
    }

    return { file, remote: Buffer.from(await response.arrayBuffer()) };
}

console.log(`Syncing ${config.files.length} file(s) for ${target} from ${config.upstream} ...`);

const downloads = await Promise.all(config.files.map(fetchProto));

const changed = [ ];

for (const { file, remote } of downloads) {
    const localPath = resolve(REPO_ROOT, config.localDir, file);
    const current = existsSync(localPath) ? await readFile(localPath) : null;

    if (current !== null && current.equals(remote)) {
        continue;
    }

    await mkdir(dirname(localPath), { recursive: true });
    await writeFile(localPath, remote);

    changed.push(`${config.localDir}/${file}`);

    console.log(`Updated ${config.localDir}/${file}`);
}

console.log(`\n${changed.length} of ${downloads.length} file(s) changed`);
