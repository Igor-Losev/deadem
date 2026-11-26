import { Readable } from 'node:stream';

import { create, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import BitWriter from '../src/core/BitWriter.js';
import Logger from '../src/core/Logger.js';
import Snappy from '../src/core/Snappy.instance.js';

import CutterConfiguration from '../src/configurations/CutterConfiguration.js';

import DemoFormat from '../src/data/DemoFormat.js';
import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import MessagePacketRaw from '../src/data/MessagePacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import MessagePacketType from '../src/data/enums/MessagePacketType.js';

import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import MessagePacketRawWriter from '../src/writers/MessagePacketRawWriter.js';

import Cutter from '../src/cut/Cutter.js';

import createDescriptors from './support/createDescriptors.js';

const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const FULL_PACKET = DemoPacketType.DEM_FULL_PACKET.id;
const PACKET = DemoPacketType.DEM_PACKET.id;
const RECOVERY = DemoPacketType.DEM_RECOVERY.id;
const SIGNON_PACKET = DemoPacketType.DEM_SIGNON_PACKET.id;
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;
const STOP = DemoPacketType.DEM_STOP.id;
const STRING_TABLES = DemoPacketType.DEM_STRING_TABLES.id;

/**
 * Messages: a type and a payload.
 */
const CONVAR = [ MessagePacketType.NET_SET_CON_VAR.id, [ 6 ] ];
const ENTITIES = [ MessagePacketType.SVC_PACKET_ENTITIES.id, [ 1, 2 ] ];
const FIRST_ENTITIES = [ MessagePacketType.SVC_PACKET_ENTITIES.id, [ 9 ] ];
const NET_TICK = [ MessagePacketType.NET_TICK.id, [ 8 ] ];
const SPAWN_GROUP_LOAD = [ MessagePacketType.NET_SPAWN_GROUP_LOAD.id, [ 7 ] ];
const USER_COMMANDS = [ MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id, [ 3 ] ];

const registry = new SchemaRegistry(createDescriptors({
    CDemoFileInfo: [
        [ 'playback_time', 1, 'float' ],
        [ 'playback_ticks', 2, 'int32' ],
        [ 'playback_frames', 3, 'int32' ]
    ],
    CDemoFullPacket: [
        [ 'string_table', 1, 'CDemoStringTables' ],
        [ 'packet', 2, 'CDemoPacket' ]
    ],
    CDemoPacket: [
        [ 'data', 3, 'bytes' ]
    ],
    CDemoStringTables: [
        [ 'tables', 1, 'CDemoStringTablesTable', true ]
    ],
    CDemoStringTablesItem: [
        [ 'str', 1, 'string' ],
        [ 'data', 2, 'bytes' ]
    ],
    CDemoStringTablesTable: [
        [ 'table_name', 1, 'string' ],
        [ 'items', 2, 'CDemoStringTablesItem', true ],
        [ 'table_flags', 4, 'int32' ]
    ],
    CSVCMsg_CreateStringTable: [
        [ 'name', 1, 'string' ],
        [ 'num_entries', 2, 'int32' ],
        [ 'user_data_fixed_size', 3, 'bool' ],
        [ 'user_data_size_bits', 5, 'int32' ],
        [ 'flags', 6, 'int32' ],
        [ 'string_data', 7, 'bytes' ],
        [ 'data_compressed', 9, 'bool' ],
        [ 'using_varint_bitcounts', 10, 'bool' ]
    ],
    CSVCMsg_UpdateStringTable: [
        [ 'table_id', 1, 'int32' ],
        [ 'num_changed_entries', 2, 'int32' ],
        [ 'string_data', 3, 'bytes' ]
    ]
}));

registry.registerDemoType(DemoPacketType.DEM_FILE_INFO);
registry.registerDemoType(DemoPacketType.DEM_FULL_PACKET);
registry.registerDemoType(DemoPacketType.DEM_PACKET);
registry.registerDemoType(DemoPacketType.DEM_SIGNON_PACKET);
registry.registerDemoType(DemoPacketType.DEM_STRING_TABLES);
registry.registerMessageType(MessagePacketType.SVC_CREATE_STRING_TABLE);
registry.registerMessageType(MessagePacketType.SVC_UPDATE_STRING_TABLE);

/**
 * Every packet: type, tick, size, payload. Tick -1 takes five bytes.
 */
const PACKETS = [
    [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 2, 10, 11 ],
    createPacket(1, [ SPAWN_GROUP_LOAD ]),
    createFullPacket(1, [ FIRST_ENTITIES, USER_COMMANDS, NET_TICK ]),
    createPacket(2, [ NET_TICK, CONVAR, ENTITIES ], true),
    createPacket(3, [ NET_TICK, ENTITIES ]),
    createFullPacket(3, [ ENTITIES, USER_COMMANDS, NET_TICK ]),
    createPacket(4, [ ]),
    [ STOP, 4, 0 ],
    [ SPAWN_GROUPS, 4, 0 ],
    createFileInfo(4, 4, 4, 4 / 64)
];

/**
 * @param {number} typeId
 * @param {Uint8Array} payload
 * @returns {Array<number>}
 */
function createBootstrapFrame(typeId, payload) {
    return [ typeId, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, payload.length, ...payload ];
}

/**
 * @param {Array<Array<number>>} packets
 * @returns {Uint8Array}
 */
function createDemo(packets) {
    const header = new Uint8Array(DemoFormat.REPLAY_HEADER_SIZE_BYTES);
    const view = new DataView(header.buffer);

    let position = header.length;

    for (const packet of packets) {
        const typeId = packet[0] & ~DemoPacketRaw.COMPRESSED_FLAG;

        if (typeId === FILE_INFO) {
            view.setUint32(8, position, true);
        } else if (typeId === SPAWN_GROUPS) {
            view.setUint32(12, position, true);
        }

        position += packet.length;
    }

    header.set(DemoFormat.STAMP, 0);

    return Uint8Array.from([ ...header, ...packets.flat() ]);
}

/**
 * DEM_FileInfo with the length of a demo: its last tick, its DEM_Packet count and its seconds.
 *
 * @param {number} tick
 * @param {number} ticks
 * @param {number} frames
 * @param {number} seconds
 * @param {boolean} [compressed=false]
 * @returns {Array<number>}
 */
function createFileInfo(tick, ticks, frames, seconds, compressed = false) {
    const descriptor = registry.getDescriptor('CDemoFileInfo');

    return createFrame(FILE_INFO, tick, toBinary(descriptor, create(descriptor, { playbackFrames: frames, playbackTicks: ticks, playbackTime: seconds })), compressed);
}

/**
 * @param {number} typeId
 * @param {number} tick
 * @param {Uint8Array} payload
 * @param {boolean} compressed
 * @returns {Array<number>}
 */
function createFrame(typeId, tick, payload, compressed) {
    const body = compressed ? Snappy.compress(payload) : payload;

    return [ compressed ? typeId | DemoPacketRaw.COMPRESSED_FLAG : typeId, tick, body.length, ...body ];
}

/**
 * @param {number} tick
 * @param {Array<Array<*>>} messages
 * @param {Array<[ string, Array<[ string, Array<number>|null ]>, number? ]>|null} [tables=null]
 * @returns {Array<number>}
 */
function createFullPacket(tick, messages, tables = null) {
    const descriptor = registry.getDescriptor('CDemoFullPacket');
    const fields = tables === null
        ? { packet: { data: encodeMessages(messages) } }
        : { packet: { data: encodeMessages(messages) }, stringTable: createStringTables(tables) };

    return createFrame(FULL_PACKET, tick, toBinary(descriptor, create(descriptor, fields)), false);
}

/**
 * @param {number} tick
 * @param {Array<Array<*>>} messages
 * @param {boolean} [compressed=false]
 * @returns {Array<number>}
 */
function createPacket(tick, messages, compressed = false) {
    const descriptor = registry.getDescriptor('CDemoPacket');

    return createFrame(PACKET, tick, toBinary(descriptor, create(descriptor, { data: encodeMessages(messages) })), compressed);
}

/**
 * @param {Array<Array<*>>} messages
 * @returns {Array<number>}
 */
function createSignonPacket(messages) {
    const descriptor = registry.getDescriptor('CDemoPacket');

    return createBootstrapFrame(SIGNON_PACKET, toBinary(descriptor, create(descriptor, { data: encodeMessages(messages) })));
}

/**
 * @param {Array<[ string, Array<[ string, Array<number>|null ]>, number? ]>} tables
 * @returns {Array<number>}
 */
function createStartTables(tables) {
    const descriptor = registry.getDescriptor('CDemoStringTables');

    return createBootstrapFrame(STRING_TABLES, toBinary(descriptor, createStringTables(tables)));
}

/**
 * @param {Array<[ string, Array<[ string, Array<number>|null ]>, number? ]>} tables
 * @returns {*}
 */
function createStringTables(tables) {
    const descriptor = registry.getDescriptor('CDemoStringTables');

    return create(descriptor, {
        tables: tables.map(([ tableName, items, tableFlags = 0 ]) => ({
            tableName,
            tableFlags,
            items: items.map(([ str, data ]) => data === null ? { str } : { str, data: Uint8Array.from(data) })
        }))
    });
}

/**
 * @param {string} name
 * @param {Array<[ number, string|null, Array<number>|null ]>} entries
 * @returns {Array<*>}
 */
function createTableCreation(name, entries) {
    const descriptor = registry.getDescriptor('CSVCMsg_CreateStringTable');

    return [
        MessagePacketType.SVC_CREATE_STRING_TABLE.id,
        toBinary(descriptor, create(descriptor, {
            name,
            numEntries: entries.length,
            userDataFixedSize: false,
            userDataSizeBits: 0,
            flags: 0,
            stringData: encodeEntries(entries),
            dataCompressed: false,
            usingVarintBitcounts: true
        }))
    ];
}

/**
 * @param {number} tableId
 * @param {Array<[ number, string|null, Array<number>|null ]>} entries
 * @returns {Array<*>}
 */
function createTableUpdate(tableId, entries) {
    const descriptor = registry.getDescriptor('CSVCMsg_UpdateStringTable');

    return [
        MessagePacketType.SVC_UPDATE_STRING_TABLE.id,
        toBinary(descriptor, create(descriptor, {
            tableId,
            numChangedEntries: entries.length,
            stringData: encodeEntries(entries)
        }))
    ];
}

/**
 * @param {Uint8Array} demo
 * @param {number} from
 * @param {number} to
 * @returns {Promise<Uint8Array>}
 */
async function cut(demo, from, to) {
    const cutter = new Cutter(registry, CutterConfiguration.DEFAULT, Logger.NOOP);

    await cutter.load(Readable.from([ demo ]));

    return cutter.cut(Readable.from([ demo ]), from, to);
}

/**
 * @param {Array<[ number, string|null, Array<number>|null ]>} entries
 * @returns {Uint8Array}
 */
function encodeEntries(entries) {
    const writer = new BitWriter(256);

    let previous = -1;

    for (const [ index, key, value ] of entries) {
        if (index === previous + 1) {
            writer.writeBitsAsUInt(1, 1);
        } else {
            writer.writeBitsAsUInt(0, 1);
            writer.writeUVarInt32(index - previous - 2);
        }

        previous = index;

        if (key !== null) {
            writer.writeBitsAsUInt(1, 1);
            writer.writeBitsAsUInt(0, 1);
            writer.writeBytes(new TextEncoder().encode(key));
            writer.writeUInt8(0);
        } else {
            writer.writeBitsAsUInt(0, 1);
        }

        if (value !== null) {
            writer.writeBitsAsUInt(1, 1);
            writer.writeUVarInt(value.length);
            writer.writeBytes(Uint8Array.from(value));
        } else {
            writer.writeBitsAsUInt(0, 1);
        }
    }

    return writer.getBuffer();
}

/**
 * @param {Array<Array<*>>} messages
 * @returns {Uint8Array}
 */
function encodeMessages(messages) {
    return new MessagePacketRawWriter(messages.map(([ type, payload ]) => new MessagePacketRaw(type, payload.length, Uint8Array.from(payload)))).all();
}

describe('Cutter', () => {
    describe('cut', () => {
        test('It should play a window over the whole demo from the full packet of the first tick on original ticks', async () => {
            const [ fileHeader, , , compressed, third, fullPacket, fourth ] = PACKETS;

            expect(await cut(createDemo(PACKETS), 1, 4)).toEqual(createDemo([
                fileHeader,
                createPacket(1, [ SPAWN_GROUP_LOAD, FIRST_ENTITIES, NET_TICK ]),
                createFullPacket(1, [ FIRST_ENTITIES, USER_COMMANDS, NET_TICK ], [ ]),
                compressed,
                third,
                fullPacket,
                fourth,
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 4, 4 / 64)
            ]));
        });

        test('It should carry state before the snapshot into the snapshot packet and keep original ticks', async () => {
            const [ fileHeader ] = PACKETS;

            expect(await cut(createDemo(PACKETS), 4, 4)).toEqual(createDemo([
                fileHeader,
                createPacket(3, [ SPAWN_GROUP_LOAD, CONVAR, ENTITIES, NET_TICK ]),
                createFullPacket(3, [ ENTITIES, USER_COMMANDS, NET_TICK ], [ ]),
                createPacket(4, [ ]),
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 2, 4 / 64)
            ]));
        });

        test('It should flush DEM_Recovery from before the snapshot onto the snapshot tick before the snapshot packet', async () => {
            const packets = [
                [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ],
                [ PACKET, 1, 0 ],
                createPacket(2, [ NET_TICK, ENTITIES ]),
                [ RECOVERY, 2, 2, 8, 1 ],
                createPacket(3, [ NET_TICK, CONVAR, ENTITIES ]),
                createFullPacket(3, [ ENTITIES, USER_COMMANDS ]),
                [ PACKET, 4, 0 ],
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 4, 4 / 64)
            ];

            const [ fileHeader ] = packets;

            expect(await cut(createDemo(packets), 4, 4)).toEqual(createDemo([
                fileHeader,
                [ RECOVERY, 3, 2, 8, 1 ],
                createPacket(3, [ CONVAR, ENTITIES ]),
                createFullPacket(3, [ ENTITIES, USER_COMMANDS ], [ ]),
                [ PACKET, 4, 0 ],
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 2, 4 / 64)
            ]));
        });

        test('It should keep original ticks and clamp the tail to the last kept tick', async () => {
            const packets = [
                [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ],
                [ PACKET, 2, 0 ],
                [ PACKET, 4, 0 ],
                [ PACKET, 6, 0 ],
                createFullPacket(6, [ ENTITIES ]),
                [ PACKET, 8, 0 ],
                [ PACKET, 10, 0 ],
                [ STOP, 10, 0 ],
                [ SPAWN_GROUPS, 10, 0 ],
                createFileInfo(10, 10, 5, 10 / 32)
            ];

            const [ fileHeader ] = packets;

            expect(await cut(createDemo(packets), 8, 8)).toEqual(createDemo([
                fileHeader,
                createPacket(6, [ ENTITIES ]),
                createFullPacket(6, [ ENTITIES ], [ ]),
                [ PACKET, 8, 0 ],
                [ STOP, 8, 0 ],
                [ SPAWN_GROUPS, 8, 0 ],
                createFileInfo(8, 8, 2, 8 / 32)
            ]));
        });

        test('It should fail on load when a string table message cannot be decoded', async () => {
            const packets = [
                [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ],
                createPacket(1, [ [ MessagePacketType.SVC_UPDATE_STRING_TABLE.id, [ 5 ] ] ]),
                [ STOP, 1, 0 ],
                [ SPAWN_GROUPS, 1, 0 ],
                createFileInfo(1, 1, 1, 1 / 64)
            ];

            await expect(cut(createDemo(packets), 1, 1)).rejects.toThrow(`Unable to read string table message [ ${MessagePacketType.SVC_UPDATE_STRING_TABLE.id} ] of packet [ 1 ]`);
        });

        test('It should start with the string tables of the packets before the snapshot, not with the tables of the full packet', async () => {
            const signon = createSignonPacket([
                createTableCreation('instancebaseline', [ [ 0, 'a', [ 1 ] ], [ 1, 'b', null ] ])
            ]);
            const initialTables = createStartTables([
                [ 'instancebaseline', [ [ 'a', [ 1 ] ], [ 'b', null ] ] ]
            ]);
            const firstUpdate = createTableUpdate(0, [ [ 0, null, [ 2, 3 ] ] ]);
            const secondUpdate = createTableUpdate(0, [ [ 2, 'c', [ 4 ] ] ]);
            const windowUpdate = createTableUpdate(0, [ [ 3, 'window', [ 5 ] ] ]);

            const fullPacket = createFullPacket(3, [ ENTITIES, USER_COMMANDS ], [
                [ 'instancebaseline', [ [ 'future', [ 99 ] ] ] ]
            ]);

            const packets = [
                [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ],
                signon,
                initialTables,
                createPacket(1, [ firstUpdate ]),
                createPacket(2, [ NET_TICK, secondUpdate, ENTITIES ]),
                fullPacket,
                createPacket(4, [ windowUpdate ]),
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 3, 4 / 64)
            ];

            const [ fileHeader, , , first ] = packets;
            const snapshotTables = [
                [ 'instancebaseline', [ [ 'a', [ 2, 3 ] ], [ 'b', null ], [ 'c', [ 4 ] ] ] ]
            ];

            expect(await cut(createDemo(packets), 4, 4)).toEqual(createDemo([
                fileHeader,
                signon,
                createStartTables(snapshotTables),
                createPacket(3, [ ENTITIES ]),
                createFullPacket(3, [ ENTITIES, USER_COMMANDS ], snapshotTables),
                createPacket(4, [ windowUpdate ]),
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 2, 4 / 64)
            ]));

            expect(await cut(createDemo(packets), 1, 1)).toEqual(createDemo([
                fileHeader,
                signon,
                initialTables,
                first,
                [ STOP, 1, 0 ],
                [ SPAWN_GROUPS, 1, 0 ],
                createFileInfo(1, 1, 1, 1 / 64)
            ]));
        });

        test('It should write the length of the cut into a compressed DEM_FileInfo uncompressed', async () => {
            const [ fileHeader ] = PACKETS;

            expect(await cut(createDemo([ ...PACKETS.slice(0, -1), createFileInfo(4, 4, 4, 4 / 64, true) ]), 4, 4)).toEqual(createDemo([
                fileHeader,
                createPacket(3, [ SPAWN_GROUP_LOAD, CONVAR, ENTITIES, NET_TICK ]),
                createFullPacket(3, [ ENTITIES, USER_COMMANDS, NET_TICK ], [ ]),
                createPacket(4, [ ]),
                [ STOP, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 2, 4 / 64)
            ]));
        });
    });
});
