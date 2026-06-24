import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer, StringTableType } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const BOMB_EVENTS = new Set([ 'bomb_pickup', 'bomb_dropped', 'bomb_planted', 'bomb_defused', 'bomb_exploded' ]);

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.CS2_REPLAY_20260511_FURIA_VS_SPIRIT_M1_DUST2);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST,
            MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT,
            MessagePacketType.SVC_PACKET_ENTITIES
        ],
        entityClasses: [ 'CCSPlayerController', 'CCSPlayerPawn' ]
    }));

    const descriptors = new Map();
    const players = new Map();
    const counts = new Map();

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

        if (descriptor === undefined || !BOMB_EVENTS.has(descriptor.name)) {
            return;
        }

        counts.set(descriptor.name, (counts.get(descriptor.name) || 0) + 1);

        const event = zip(descriptor, messagePacket.data.keys);

        let who;

        if (event.userid !== undefined) {
            who = getName(players, event.userid);
        } else {
            who = resolvePawn(parser.getDemo(), event.userid_pawn);
        }

        let site = '';

        if (event.site !== undefined) {
            site = ` site=${event.site}`;
        }

        console.log(`${descriptor.name.padEnd(16)} ${who}${site}`);
    });

    await parser.parse(reader);
    await parser.dispose();

    console.log('\n=== Summary ===');

    for (const name of BOMB_EVENTS) {
        console.log(`  ${name.padEnd(16)} ${counts.get(name) || 0}`);
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

/**
 * @param {Map<number, string>} players
 * @param {number} userid
 * @returns {string}
 */
function getName(players, userid) {
    return players.get(userid) || `userid=${userid}`;
}

/**
 * @param {Demo} demo
 * @param {number} pawnHandle
 * @returns {string}
 */
function resolvePawn(demo, pawnHandle) {
    const pawn = demo.getEntityByHandle(pawnHandle);

    if (pawn === null) {
        return `pawn=${pawnHandle}`;
    }

    const controllerHandle = pawn.getField('m_hController');
    const controller = demo.getEntityByHandle(controllerHandle);

    if (controller === null) {
        return `pawn=${pawnHandle}`;
    }

    return controller.getField('m_iszPlayerName');
}
