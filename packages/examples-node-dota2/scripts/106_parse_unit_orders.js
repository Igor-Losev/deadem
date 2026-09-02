import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const UINT32_SIGN_BIT = 2 ** 31;

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DOTA2_REPLAY_8960991322);

    const parser = new Parser(new ParserConfiguration({
        messagePacketTypes: [ MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS, MessagePacketType.SVC_PACKET_ENTITIES ],
        entityClasses: [ 'CDOTAPlayerController' ]
    }));

    const rows = new Map();

    let orders = 0;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.DOTA_UM_SPECTATOR_PLAYER_UNIT_ORDERS) {
            return;
        }

        const data = messagePacket.data;

        const row = getRow(rows, data.entindex);

        if (row.name === null) {
            row.name = resolveName(parser.getDemo().getEntity(data.entindex));
        }

        if (row.tickFirst === null) {
            row.tickFirst = demoPacket.tick;
        }

        if (data.lastOrderLatency < UINT32_SIGN_BIT) {
            row.latency += data.lastOrderLatency;
            row.latencySamples += 1;
        }

        if (data.units.length > 1) {
            row.multiUnit += 1;
        }

        if (data.queue) {
            row.queued += 1;
        }

        row.orders += 1;
        row.tickLast = demoPacket.tick;

        orders += 1;
    });

    await parser.parse(reader);

    const tickRate = parser.getDemo().server.tickRate;

    await parser.dispose();

    console.log(`\n=== Unit orders issued by each player across ${format(orders)} orders (server runs at ${format(tickRate)} ticks/s) ===`);
    console.log(`${'Player'.padEnd(20)} ${'Orders'.padStart(9)} ${'Playtime'.padStart(10)} ${'Orders/min'.padStart(12)} ${'Queued'.padStart(8)} ${'Multi-unit'.padStart(12)} ${'Avg latency (ms)'.padStart(18)}`);

    for (const row of [ ...rows.values() ].sort((a, b) => b.orders - a.orders)) {
        const name = row.name === null ? `entity ${row.index}` : row.name;
        const minutes = (row.tickLast - row.tickFirst) / tickRate / 60;

        const playtime = `${format(minutes, 1)} min`;
        const queued = `${format(100 * row.queued / row.orders, 2)}%`;
        const multiUnit = `${format(100 * row.multiUnit / row.orders, 1)}%`;

        console.log(`${name.padEnd(20)} ${format(row.orders).padStart(9)} ${playtime.padStart(10)} ${format(row.orders / minutes, 1).padStart(12)} ${queued.padStart(8)} ${multiUnit.padStart(12)} ${format(row.latency / row.latencySamples, 1).padStart(18)}`);
    }

    const printer = new Printer(parser);

    printer.printStats();
})();

/**
 * @param {Map<number, Object>} rows
 * @param {number} index
 * @returns {Object}
 */
function getRow(rows, index) {
    let row = rows.get(index);

    if (row === undefined) {
        row = {
            index,
            name: null,
            orders: 0,
            queued: 0,
            multiUnit: 0,
            latency: 0,
            latencySamples: 0,
            tickFirst: null,
            tickLast: 0
        };

        rows.set(index, row);
    }

    return row;
}

/**
 * @param {Entity|null} entity
 * @returns {string|null}
 */
function resolveName(entity) {
    if (entity === null) {
        return null;
    }

    return entity.getField('m_iszPlayerName') ?? null;
}

/**
 * @param {number} value
 * @param {number} [digits=0]
 * @returns {string}
 */
function format(value, digits = 0) {
    return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
