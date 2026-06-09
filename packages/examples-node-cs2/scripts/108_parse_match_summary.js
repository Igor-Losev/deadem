import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.CS2_REPLAY_20260511_FURIA_VS_SPIRIT_M1_DUST2);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST,
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT,
            MessagePacketType.CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA
        ]
    }));

    const descriptors = new Map();
    const players = new Map();
    const stats = new Map();

    let matchEnd = null;

    parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
        if (players.size === 0 && !demoPacket.getIsInitial()) {
            const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

            for (const entry of userInfo.getEntries()) {
                if (!Number.isInteger(entry.value.userid)) {
                    continue;
                }

                players.set(entry.value.userid, entry.value.name);

                stats.set(entry.value.userid, {
                    name: entry.value.name,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    headshots: 0
                });
            }
        }
    });

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, async (demoPacket, messagePacket) => {
        if (messagePacket.type === MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST) {
            for (const descriptor of messagePacket.data.descriptors) {
                descriptors.set(descriptor.eventid, descriptor);
            }

            return;
        }

        if (messagePacket.type === MessagePacketType.CS_UM_END_OF_MATCH_ALL_PLAYERS_DATA) {
            matchEnd = messagePacket.data;

            return;
        }

        if (messagePacket.type !== MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT) {
            return;
        }

        const descriptor = descriptors.get(messagePacket.data.eventid);

        if (descriptor === undefined || descriptor.name !== 'player_death') {
            return;
        }

        const event = zip(descriptor, messagePacket.data.keys);

        const attacker = stats.get(event.attacker);
        const victim = stats.get(event.userid);
        const assister = stats.get(event.assister);

        if (attacker !== undefined && event.attacker !== event.userid) {
            attacker.kills += 1;

            if (event.headshot) {
                attacker.headshots += 1;
            }
        }

        if (victim !== undefined) {
            victim.deaths += 1;
        }

        if (assister !== undefined) {
            assister.assists += 1;
        }
    });

    await parser.parse(reader);
    await parser.dispose();

    const ranked = [ ...stats.values() ]
        .filter(row => row.kills > 0 || row.deaths > 0)
        .sort((a, b) => b.kills - a.kills);

    console.log('\n=== Scoreboard ===');
    console.log(`${'Player'.padEnd(20)} ${'K'.padStart(4)} ${'D'.padStart(4)} ${'A'.padStart(4)} ${'HS%'.padStart(5)} ${'K/D'.padStart(6)}`);

    for (const row of ranked) {
        let headshotPct = '—';

        if (row.kills > 0) {
            headshotPct = `${Math.round(100 * row.headshots / row.kills)}%`;
        }

        let kd;

        if (row.deaths > 0) {
            kd = (row.kills / row.deaths).toFixed(2);
        } else {
            kd = row.kills.toFixed(2);
        }

        console.log(`${row.name.padEnd(20)} ${String(row.kills).padStart(4)} ${String(row.deaths).padStart(4)} ${String(row.assists).padStart(4)} ${headshotPct.padStart(5)} ${kd.padStart(6)}`);
    }

    if (matchEnd !== null && Array.isArray(matchEnd.allplayerdata)) {
        console.log('\n=== Match-end accolades ===');

        for (const player of matchEnd.allplayerdata) {
            if (player.nomination !== null && player.nomination !== undefined) {
                console.log(`  ${player.name.padEnd(20)} accolade=${player.nomination.eaccolade} value=${player.nomination.value} position=${player.nomination.position}`);
            }
        }
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
