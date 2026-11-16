import { Readable } from 'node:stream';

import { describe, expect, test } from 'vitest';

import Logger from '../src/core/Logger.js';

import CutterConfiguration from '../src/configurations/CutterConfiguration.js';

import DemoFormat from '../src/data/DemoFormat.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';

import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import Cutter from '../src/cut/Cutter.js';

import createDescriptors from './support/createDescriptors.js';

const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;

/**
 * Every packet: type, tick, size, payload. Tick -1 takes five bytes.
 */
const PACKETS = [
    [ DemoPacketType.DEM_FILE_HEADER.id, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 2, 10, 11 ],
    [ DemoPacketType.DEM_PACKET.id, 1, 3, 1, 2, 3 ],
    [ DemoPacketType.DEM_FULL_PACKET.id, 1, 1, 9 ],
    [ DemoPacketType.DEM_PACKET.id | DemoFormat.COMPRESSED_FLAG, 2, 2, 4, 5 ],
    [ DemoPacketType.DEM_STOP.id, 2, 0 ],
    [ SPAWN_GROUPS, 2, 0 ],
    [ FILE_INFO, 2, 1, 6 ]
];

const registry = new SchemaRegistry(createDescriptors({ }));

/**
 * @param {Array<Array<number>>} packets
 * @returns {Uint8Array}
 */
function createDemo(packets) {
    const header = new Uint8Array(DemoFormat.REPLAY_HEADER_SIZE_BYTES);
    const view = new DataView(header.buffer);

    let position = header.length;

    for (const packet of packets) {
        if (packet[0] === FILE_INFO) {
            view.setUint32(8, position, true);
        } else if (packet[0] === SPAWN_GROUPS) {
            view.setUint32(12, position, true);
        }

        position += packet.length;
    }

    header.set(DemoFormat.STAMP, 0);

    return Uint8Array.from([ ...header, ...packets.flat() ]);
}

describe('Cutter', () => {
    describe('cut', () => {
        test('It should write every packet of the demo as is', async () => {
            const demo = createDemo(PACKETS);
            const cutter = new Cutter(registry, CutterConfiguration.DEFAULT, Logger.NOOP);

            expect(await cutter.cut(Readable.from([ demo ]))).toEqual(demo);
        });
    });
});
