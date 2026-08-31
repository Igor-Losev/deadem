import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const CONTROLLER_FIELDS = [ 'm_hController', 'm_hDefaultController' ];

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DEADLOCK_REPLAY_100576005);

    const parser = new Parser(new ParserConfiguration({
        messagePacketTypes: [ MessagePacketType.SVC_USER_COMMANDS, MessagePacketType.SVC_PACKET_ENTITIES ],
        entityClasses: [ 'CCitadelPlayerController', 'CCitadelPlayerPawn', 'CCitadelObserverPawn' ]
    }));

    const names = new Map();
    const rows = new Map();

    let commands = 0;

    parser.registerPostInterceptor(InterceptorStage.USER_COMMAND, (demoPacket, messagePacket, events) => {
        const demo = parser.getDemo();

        for (const event of events) {
            const state = event.userCommand.state;
            const base = state.base;

            if (base?.viewangles === undefined || state.vecCameraPosition === undefined) {
                continue;
            }

            const camera = state.vecCameraPosition;
            const viewangles = base.viewangles;
            const aimedAt = state.enemyHeroAimedAt;

            const row = getRow(rows, event.userCommand.slot);

            if (row.name === null) {
                row.name = resolveName(demo, demo.getEntityByHandle(base.pawnEntityHandle));
            }

            if (row.tickFirst === null) {
                row.tickFirst = base.clientTick;
            }

            if (row.viewX !== null) {
                row.aimPath += Math.abs(wrapDegrees(viewangles.x - row.viewX)) + Math.abs(wrapDegrees(viewangles.y - row.viewY));
                row.cameraPath += Math.hypot(camera.x - row.cameraX, camera.y - row.cameraY, camera.z - row.cameraZ);
            }

            if (aimedAt !== -1) {
                row.targeted += 1;
                row.targets.set(aimedAt, (row.targets.get(aimedAt) || 0) + 1);

                if (!names.has(aimedAt)) {
                    const name = resolveName(demo, demo.getEntity(aimedAt));

                    if (name !== null) {
                        names.set(aimedAt, name);
                    }
                }
            }

            row.commands += 1;
            row.tickLast = base.clientTick;
            row.viewX = viewangles.x;
            row.viewY = viewangles.y;
            row.cameraX = camera.x;
            row.cameraY = camera.y;
            row.cameraZ = camera.z;

            commands += 1;
        }
    });

    await parser.parse(reader);

    const tickRate = parser.getDemo().server.tickRate;

    await parser.dispose();

    console.log(`\n=== Input sent by each player across ${format(commands)} user commands (server runs at ${format(tickRate)} ticks/s) ===`);
    console.log(`${'Player'.padEnd(18)} ${'Commands'.padStart(11)} ${'Input time (min)'.padStart(16)} ${'Aim travel (deg)'.padStart(16)} ${'Camera travel'.padStart(14)} ${'Aiming at enemy'.padStart(15)} ${'Most aimed at'.padStart(16)}`);

    for (const row of [ ...rows.values() ].sort((a, b) => b.commands - a.commands)) {
        const name = row.name === null ? `slot ${row.slot}` : row.name;
        const minutes = (row.tickLast - row.tickFirst) / tickRate / 60;
        const aiming = `${format(100 * row.targeted / row.commands, 1)}%`;

        console.log(`${name.padEnd(18)} ${format(row.commands).padStart(11)} ${format(minutes, 1).padStart(16)} ${format(row.aimPath).padStart(16)} ${format(row.cameraPath).padStart(14)} ${aiming.padStart(15)} ${getTopTarget(row.targets, names).padStart(16)}`);
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
            aimPath: 0,
            cameraPath: 0,
            targeted: 0,
            targets: new Map(),
            tickFirst: null,
            tickLast: 0,
            viewX: null,
            viewY: 0,
            cameraX: 0,
            cameraY: 0,
            cameraZ: 0
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
 * @param {Map<number, number>} targets
 * @param {Map<number, string>} names
 * @returns {string}
 */
function getTopTarget(targets, names) {
    let index = -1;
    let best = 0;

    for (const [ candidate, count ] of targets) {
        if (count > best) {
            index = candidate;
            best = count;
        }
    }

    if (index === -1) {
        return '—';
    }

    return names.get(index) ?? `entity ${index}`;
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
