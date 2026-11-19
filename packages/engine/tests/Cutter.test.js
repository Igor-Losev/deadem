import { Readable } from 'node:stream';

import { create, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import Logger from '../src/core/Logger.js';
import Snappy from '../src/core/Snappy.instance.js';

import CutterConfiguration from '../src/configurations/CutterConfiguration.js';

import DemoFormat from '../src/data/DemoFormat.js';
import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';

import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import Cutter from '../src/cut/Cutter.js';

import createDescriptors from './support/createDescriptors.js';

const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;

const registry = new SchemaRegistry(createDescriptors({
    CDemoFileInfo: [
        [ 'playback_time', 1, 'float' ],
        [ 'playback_ticks', 2, 'int32' ],
        [ 'playback_frames', 3, 'int32' ]
    ]
}));

registry.registerDemoType(DemoPacketType.DEM_FILE_INFO);

/**
 * Every packet: type, tick, size, payload. Tick -1 takes five bytes.
 */
const PACKETS = [
    [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 2, 10, 11 ],
    [ DemoPacketType.DEM_PACKET.id, 1, 3, 1, 2, 3 ],
    [ DemoPacketType.DEM_FULL_PACKET.id, 1, 1, 9 ],
    [ DemoPacketType.DEM_PACKET.id | DemoPacketRaw.COMPRESSED_FLAG, 2, 2, 4, 5 ],
    [ DemoPacketType.DEM_PACKET.id, 3, 1, 6 ],
    [ DemoPacketType.DEM_PACKET.id, 4, 1, 7 ],
    [ DemoPacketType.DEM_STOP.id, 4, 0 ],
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

describe('Cutter', () => {
    describe('cut', () => {
        test('It should write every packet as is when the window covers the demo', async () => {
            const demo = createDemo(PACKETS);

            expect(await cut(demo, 1, 4)).toEqual(demo);
        });

        test('It should move the window right after the first packet and the tail onto its last tick', async () => {
            const [ fileHeader, first ] = PACKETS;

            expect(await cut(createDemo(PACKETS), 3, 4)).toEqual(createDemo([
                fileHeader,
                first,
                [ DemoPacketType.DEM_PACKET.id, 2, 1, 6 ],
                [ DemoPacketType.DEM_PACKET.id, 3, 1, 7 ],
                [ DemoPacketType.DEM_STOP.id, 3, 0 ],
                [ SPAWN_GROUPS, 3, 0 ],
                createFileInfo(3, 3, 3, 3 / 64)
            ]));
        });

        test('It should keep the step of the demo between the first packet and the window', async () => {
            const packets = [
                [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ],
                [ DemoPacketType.DEM_PACKET.id, 2, 0 ],
                [ DemoPacketType.DEM_PACKET.id, 4, 0 ],
                [ DemoPacketType.DEM_PACKET.id, 6, 0 ],
                [ DemoPacketType.DEM_STOP.id, 6, 0 ],
                [ SPAWN_GROUPS, 6, 0 ],
                createFileInfo(6, 6, 3, 6 / 32)
            ];

            const [ fileHeader, first ] = packets;

            expect(await cut(createDemo(packets), 6, 6)).toEqual(createDemo([
                fileHeader,
                first,
                [ DemoPacketType.DEM_PACKET.id, 4, 0 ],
                [ DemoPacketType.DEM_STOP.id, 4, 0 ],
                [ SPAWN_GROUPS, 4, 0 ],
                createFileInfo(4, 4, 2, 4 / 32)
            ]));
        });

        test('It should write the length of the cut into a compressed DEM_FileInfo uncompressed', async () => {
            const [ fileHeader, first ] = PACKETS;

            expect(await cut(createDemo([ ...PACKETS.slice(0, -1), createFileInfo(4, 4, 4, 4 / 64, true) ]), 3, 4)).toEqual(createDemo([
                fileHeader,
                first,
                [ DemoPacketType.DEM_PACKET.id, 2, 1, 6 ],
                [ DemoPacketType.DEM_PACKET.id, 3, 1, 7 ],
                [ DemoPacketType.DEM_STOP.id, 3, 0 ],
                [ SPAWN_GROUPS, 3, 0 ],
                createFileInfo(3, 3, 3, 3 / 64)
            ]));
        });
    });
});
