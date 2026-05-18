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

    parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
        if (players.size === 0 && !demoPacket.getIsInitial()) {
            const userInfo = parser.getDemo().stringTableContainer.getByName(StringTableType.USER_INFO.name);

            for (const entry of userInfo.getEntries()) {
                if (Number.isInteger(entry.value.userid)) {
                    players.set(entry.value.userid, entry.value.name);
                }
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

        if (messagePacket.type !== MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT) {
            return;
        }

        const descriptor = descriptors.get(messagePacket.data.eventid);

        if (descriptor === undefined || descriptor.name !== 'player_death') {
            return;
        }

        const event = zip(descriptor, messagePacket.data.keys);

        const attacker = getName(players, event.attacker);
        const victim = getName(players, event.userid);

        let assister = null;

        if (event.assister !== 65535) {
            assister = getName(players, event.assister);
        }

        const flags = [ ];

        if (event.headshot) {
            flags.push('HS');
        }

        if (event.noscope) {
            flags.push('NS');
        }

        if (event.attackerblind) {
            flags.push('BLIND');
        }

        if (event.thrusmoke) {
            flags.push('SMOKE');
        }

        if (event.penetrated > 0) {
            flags.push(`WB×${event.penetrated}`);
        }

        let tag = '';

        if (flags.length > 0) {
            tag = ` [${flags.join(',')}]`;
        }

        let assist = '';

        if (assister !== null) {
            assist = ` + ${assister}`;

            if (event.assistedflash) {
                assist += ' (flash)';
            }
        }

        console.log(`${attacker.padEnd(20)} → ${victim.padEnd(20)} ${event.weapon.padEnd(12)} ${event.distance.toFixed(1).padStart(6)}m${tag}${assist}`);
    });

    await parser.parse(reader);
    await parser.dispose();

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

/**
 * @param {Map<number, string>} players
 * @param {number} userid
 * @returns {string}
 */
function getName(players, userid) {
    return players.get(userid) || `userid=${userid}`;
}
