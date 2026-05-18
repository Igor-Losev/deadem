import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.CS2_REPLAY_20260511_FURIA_VS_SPIRIT_M1_DUST2);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST,
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT
        ]
    }));

    const descriptors = new Map();
    const players = new Map();
    const stats = new Map();

    parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
        if (players.size > 0 || demoPacket.getIsInitial()) {
            return;
        }

        const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

        for (const entry of userInfo.getEntries()) {
            if (!Number.isInteger(entry.value.userid)) {
                continue;
            }

            players.set(entry.value.userid, entry.value.name);

            stats.set(entry.value.userid, {
                name: entry.value.name,
                hits: 0,
                damage: 0,
                headHits: 0,
                byWeapon: new Map()
            });
        }
    });

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type === MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST) {
            for (const descriptor of messagePacket.data.descriptors) {
                descriptors.set(descriptor.eventid, descriptor);
            }

            return;
        }

        if (messagePacket.type !== MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT) {
            return;
        }

        const descriptor = descriptors.get(messagePacket.data.eventid);

        if (descriptor === undefined || descriptor.name !== 'player_hurt') {
            return;
        }

        const event = zip(descriptor, messagePacket.data.keys);

        if (event.attacker === event.userid) {
            return;
        }

        const row = stats.get(event.attacker);

        if (row === undefined) {
            return;
        }

        row.hits += 1;
        row.damage += event.dmg_health;

        if (event.hitgroup === 1) {
            row.headHits += 1;
        }

        row.byWeapon.set(event.weapon, (row.byWeapon.get(event.weapon) || 0) + event.dmg_health);
    });

    await parser.parse(reader);
    await parser.dispose();

    const ranked = [ ...stats.values() ]
        .filter(row => row.hits > 0)
        .sort((a, b) => b.damage - a.damage);

    console.log('\n=== Damage dealt ===');
    console.log(`${'Player'.padEnd(20)} ${'Hits'.padStart(5)} ${'Dmg'.padStart(6)} ${'HS%'.padStart(5)} ${'Avg/Hit'.padStart(8)}  Top weapons`);

    for (const row of ranked) {
        const headshotPct = `${Math.round(100 * row.headHits / row.hits)}%`;
        const avgPerHit = (row.damage / row.hits).toFixed(1);

        const topWeapons = [ ...row.byWeapon.entries() ]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([ weapon, damage ]) => `${weapon}:${damage}`)
            .join(', ');

        console.log(`${row.name.padEnd(20)} ${String(row.hits).padStart(5)} ${String(row.damage).padStart(6)} ${headshotPct.padStart(5)} ${avgPerHit.padStart(8)}  ${topWeapons}`);
    }

    const printer = new Printer(parser);

    printer.printStats();
})();

/**
 * @param {Object} descriptor
 * @param {Array<Object>} keys
 * @returns {Object}
 */
function zip(descriptor, keys) {
    const out = { };

    for (let i = 0; i < descriptor.keys.length; i++) {
        out[descriptor.keys[i].name] = valueOf(keys[i]);
    }

    return out;
}

/**
 * @param {Object} key
 * @returns {*}
 */
function valueOf(key) {
    if (key === null || key === undefined) {
        return null;
    }

    switch (key.type) {
        case 1: return key.valString;
        case 2: return key.valFloat;
        case 3: return key.valLong;
        case 4: return key.valShort;
        case 5: return key.valByte;
        case 6: return key.valBool;
        case 7: return key.valUint64;
        case 8: return key.valLong;
        case 9: return key.valShort;
        default: return null;
    }
}
