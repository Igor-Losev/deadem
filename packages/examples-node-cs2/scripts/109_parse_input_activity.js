import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const CONTROLLER_FIELDS = [ 'm_hController', 'm_hDefaultController' ];

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.CS2_REPLAY_20260815_SPIRIT_VS_BIG_M3_MIRAGE);

    const parser = new Parser(new ParserConfiguration({
        messagePacketTypes: [ MessagePacketType.SVC_USER_COMMANDS, MessagePacketType.SVC_PACKET_ENTITIES ],
        entityClasses: [ 'CCSPlayerController', 'CCSPlayerPawn', 'CCSObserverPawn' ]
    }));

    const rows = new Map();

    let commands = 0;

    parser.registerPostInterceptor(InterceptorStage.USER_COMMAND, (demoPacket, messagePacket, events) => {
        const demo = parser.getDemo();

        for (const event of events) {
            const base = event.userCommand.state.base;

            if (base?.viewangles === undefined) {
                continue;
            }

            const viewangles = base.viewangles;

            const row = getRow(rows, event.userCommand.slot);

            if (row.name === null) {
                row.name = resolveName(demo, demo.getEntityByHandle(base.pawnEntityHandle));
            }

            if (row.tickFirst === null) {
                row.tickFirst = base.clientTick;
            }

            if (row.viewX !== null) {
                row.viewPath += Math.abs(wrapDegrees(viewangles.x - row.viewX)) + Math.abs(wrapDegrees(viewangles.y - row.viewY));
            }

            if (base.forwardmove !== 0 || base.leftmove !== 0) {
                row.moving += 1;
            }

            if (base.mousedx !== 0 || base.mousedy !== 0) {
                row.mouse += 1;
            }

            row.commands += 1;
            row.tickLast = base.clientTick;
            row.viewX = viewangles.x;
            row.viewY = viewangles.y;

            commands += 1;
        }
    });

    await parser.parse(reader);

    const tickRate = parser.getDemo().server.tickRate;

    await parser.dispose();

    console.log(`\n=== Input sent by each player across ${format(commands)} user commands (server runs at ${format(tickRate)} ticks/s) ===`);
    console.log(`${'Player'.padEnd(18)} ${'Commands'.padStart(11)} ${'Playtime'.padStart(10)} ${'View (deg/s)'.padStart(14)} ${'Moving'.padStart(8)} ${'Mouse input'.padStart(13)}`);

    for (const row of [ ...rows.values() ].sort((a, b) => b.commands - a.commands)) {
        const name = row.name === null ? `slot ${row.slot}` : row.name;
        const seconds = (row.tickLast - row.tickFirst) / tickRate;

        const playtime = `${format(seconds / 60, 1)} min`;
        const moving = `${format(100 * row.moving / row.commands, 1)}%`;
        const mouse = `${format(100 * row.mouse / row.commands, 1)}%`;

        console.log(`${name.padEnd(18)} ${format(row.commands).padStart(11)} ${playtime.padStart(10)} ${format(row.viewPath / seconds, 1).padStart(14)} ${moving.padStart(8)} ${mouse.padStart(13)}`);
    }

    const printer = new Printer(parser);

    printer.printStats();
})();

/**
 * @param {Map<number, Object>} rows
 * @param {number} slot
 * @returns {Object}
 */
function getRow(rows, slot) {
    let row = rows.get(slot);

    if (row === undefined) {
        row = {
            slot,
            name: null,
            commands: 0,
            moving: 0,
            mouse: 0,
            viewPath: 0,
            tickFirst: null,
            tickLast: 0,
            viewX: null,
            viewY: 0
        };

        rows.set(slot, row);
    }

    return row;
}

/**
 * @param {Demo} demo
 * @param {Entity|null} entity
 * @returns {string|null}
 */
function resolveName(demo, entity) {
    if (entity === null) {
        return null;
    }

    for (const field of CONTROLLER_FIELDS) {
        const handle = entity.getField(field);

        if (!Number.isInteger(handle)) {
            continue;
        }

        const controller = demo.getEntityByHandle(handle);

        if (controller !== null) {
            return controller.getField('m_iszPlayerName') ?? null;
        }
    }

    return null;
}

/**
 * @param {number} degrees
 * @returns {number}
 */
function wrapDegrees(degrees) {
    return degrees - 360 * Math.round(degrees / 360);
}

/**
 * @param {number} value
 * @param {number} [digits=0]
 * @returns {string}
 */
function format(value, digits = 0) {
    return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
