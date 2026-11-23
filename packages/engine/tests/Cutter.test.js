import { Readable } from 'node:stream';

import { create, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

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
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;
const STOP = DemoPacketType.DEM_STOP.id;

/**
 * Messages: a type and a payload.
 */
const ENTITIES = [ MessagePacketType.SVC_PACKET_ENTITIES.id, [ 1, 2 ] ];
const FIRST_ENTITIES = [ MessagePacketType.SVC_PACKET_ENTITIES.id, [ 9 ] ];
const NET_TICK = [ MessagePacketType.NET_TICK.id, [ 8 ] ];
const USER_COMMANDS = [ MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id, [ 3 ] ];

const registry = new SchemaRegistry(createDescriptors({
    CDemoFileInfo: [
        [ 'playback_time', 1, 'float' ],
        [ 'playback_ticks', 2, 'int32' ],
        [ 'playback_frames', 3, 'int32' ]
    ],
    CDemoFullPacket: [
        [ 'packet', 2, 'CDemoPacket' ]
    ],
    CDemoPacket: [
        [ 'data', 3, 'bytes' ]
    ]
}));

registry.registerDemoType(DemoPacketType.DEM_FILE_INFO);
registry.registerDemoType(DemoPacketType.DEM_FULL_PACKET);
registry.registerDemoType(DemoPacketType.DEM_PACKET);

/**
 * Every packet: type, tick, size, payload. Tick -1 takes five bytes.
 */
const PACKETS = [
    [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 2, 10, 11 ],
    [ PACKET, 1, 3, 1, 2, 3 ],
    createFullPacket(1, [ FIRST_ENTITIES, USER_COMMANDS, NET_TICK ]),
    [ PACKET | DemoPacketRaw.COMPRESSED_FLAG, 2, 2, 4, 5 ],
    [ PACKET, 3, 1, 6 ],
    createFullPacket(3, [ ENTITIES, USER_COMMANDS, NET_TICK ]),
    [ PACKET, 4, 1, 7 ],
    [ STOP, 4, 0 ],
    [ SPAWN_GROUPS, 4, 0 ],
    createFileInfo(4, 4, 4, 4 / 64)
];

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
    const payload = toBinary(descriptor, create(descriptor, { playbackFrames: frames, playbackTicks: ticks, playbackTime: seconds }));

    if (compressed) {
        const compressedPayload = Snappy.compress(payload);

        return [ FILE_INFO | DemoPacketRaw.COMPRESSED_FLAG, tick, compressedPayload.length, ...compressedPayload ];
    }

    return [ FILE_INFO, tick, payload.length, ...payload ];
}

/**
 * @param {number} tick
 * @param {Array<Array<*>>} messages
 * @returns {Array<number>}
 */
function createFullPacket(tick, messages) {
    const descriptor = registry.getDescriptor('CDemoFullPacket');
    const payload = toBinary(descriptor, create(descriptor, { packet: { data: encodeMessages(messages) } }));

    return [ FULL_PACKET, tick, payload.length, ...payload ];
}

/**
 * @param {number} tick
 * @param {Array<Array<*>>} messages
 * @returns {Array<number>}
 */
function createPacket(tick, messages) {
    const descriptor = registry.getDescriptor('CDemoPacket');
    const payload = toBinary(descriptor, create(descriptor, { data: encodeMessages(messages) }));

    return [ PACKET, tick, payload.length, ...payload ];
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
 * @param {Array<Array<*>>} messages
 * @returns {Uint8Array}
 */
function encodeMessages(messages) {
    return new MessagePacketRawWriter(messages.map(([ type, payload ]) => new MessagePacketRaw(type, payload.length, Uint8Array.from(payload)))).all();
}

describe('Cutter', () => {
    describe('cut', () => {
        test('It should play a window over the whole demo from the full packet of the first tick', async () => {
            const [ fileHeader, first, , compressed, third, fullPacket, fourth ] = PACKETS;

            expect(await cut(createDemo(PACKETS), 1, 4)).toEqual(createDemo([
                fileHeader,
                first,
                createPacket(2, [ FIRST_ENTITIES, NET_TICK ]),
                createFullPacket(2, [ FIRST_ENTITIES, USER_COMMANDS, NET_TICK ]),
                [ compressed[0], 3, ...compressed.slice(2) ],
                [ third[0], 4, ...third.slice(2) ],
                [ fullPacket[0], 4, ...fullPacket.slice(2) ],
                [ fourth[0], 5, ...fourth.slice(2) ],
                [ STOP, 5, 0 ],
                [ SPAWN_GROUPS, 5, 0 ],
                createFileInfo(5, 5, 5, 5 / 64)
            ]));
        });

        test('It should play the window from the last full packet before it, with its packet first', async () => {
            const [ fileHeader, first ] = PACKETS;

            expect(await cut(createDemo(PACKETS), 4, 4)).toEqual(createDemo([
                fileHeader,
                first,
                createPacket(2, [ ENTITIES, NET_TICK ]),
                createFullPacket(2, [ ENTITIES, USER_COMMANDS, NET_TICK ]),
                [ PACKET, 3, 1, 7 ],
                [ STOP, 3, 0 ],
                [ SPAWN_GROUPS, 3, 0 ],
                createFileInfo(3, 3, 3, 3 / 64)
            ]));
        });

        test('It should keep the step of the demo after the full packet', async () => {
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

            const [ fileHeader, first ] = packets;

            expect(await cut(createDemo(packets), 8, 10)).toEqual(createDemo([
                fileHeader,
                first,
                createPacket(3, [ ENTITIES ]),
                createFullPacket(3, [ ENTITIES ]),
                [ PACKET, 5, 0 ],
                [ PACKET, 7, 0 ],
                [ STOP, 7, 0 ],
                [ SPAWN_GROUPS, 7, 0 ],
                createFileInfo(7, 7, 4, 7 / 32)
            ]));
        });

        test('It should write the length of the cut into a compressed DEM_FileInfo uncompressed', async () => {
            const [ fileHeader, first ] = PACKETS;

            expect(await cut(createDemo([ ...PACKETS.slice(0, -1), createFileInfo(4, 4, 4, 4 / 64, true) ]), 4, 4)).toEqual(createDemo([
                fileHeader,
                first,
                createPacket(2, [ ENTITIES, NET_TICK ]),
                createFullPacket(2, [ ENTITIES, USER_COMMANDS, NET_TICK ]),
                [ PACKET, 3, 1, 7 ],
                [ STOP, 3, 0 ],
                [ SPAWN_GROUPS, 3, 0 ],
                createFileInfo(3, 3, 3, 3 / 64)
            ]));
        });
    });
});
