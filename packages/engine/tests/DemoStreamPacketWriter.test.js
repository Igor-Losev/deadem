import Stream from 'node:stream';

import { describe, expect, test } from 'vitest';

import Pipeline from '../src/core/stream/Pipeline.node.js';

import StreamConfiguration from '../src/configurations/StreamConfiguration.js';

import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';
import VarInt32 from '../src/data/VarInt32.js';

import DemoPacketRawReplayExtractor from '../src/extractors/DemoPacketRawReplayExtractor.js';

import DemoStreamPacketWriter from '../src/stream/DemoStreamPacketWriter.js';

const EMPTY = new Uint8Array(0);
const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const HEADER_SIZE_BYTES = 16;
const HIGH_WATER_MARK = 4;
const PACKET = DemoPacketType.DEM_PACKET.id;
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;

function createFrame(type, payload) {
    return new DemoPacketRaw(0, new VarInt32(type), DemoSource.REPLAY, new VarInt32(0), new VarInt32(payload.length), payload);
}

function createTail() {
    return [ createFrame(SPAWN_GROUPS, EMPTY), createFrame(FILE_INFO, EMPTY) ];
}

function readFrameAt(bytes, offset) {
    return new DemoPacketRawReplayExtractor(bytes.subarray(offset)).retrieve(0).next().value;
}

function readFrames(bytes) {
    return Array.from(new DemoPacketRawReplayExtractor(bytes.subarray(HEADER_SIZE_BYTES)).retrieve(0)).filter(frame => frame !== null);
}

function readOffsets(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset);

    return { fileInfo: view.getInt32(8, true), spawnGroups: view.getInt32(12, true) };
}

async function write(frames) {
    const writer = new DemoStreamPacketWriter(new StreamConfiguration({ streamHighWaterMark: HIGH_WATER_MARK }));

    await new Pipeline(Stream.Readable.from(frames, { objectMode: true }), [ ], writer).ready();

    return writer.getBuffer();
}

describe('DemoStreamPacketWriter', () => {
    describe('When frames pass through', () => {
        test('It should produce a file that reads back', async () => {
            const file = await write([ createFrame(PACKET, new Uint8Array([ 1, 2, 3 ])), createFrame(PACKET | DemoPacketRaw.COMPRESSED_FLAG, new Uint8Array([ 4 ])), ...createTail() ]);

            expect(new TextDecoder().decode(file.subarray(0, 8))).toBe('PBDEMS2\0');
            expect(readFrames(file).map(frame => [ frame.getTypeId(), frame.getIsCompressed(), Array.from(frame.payload) ])).toEqual([
                [ PACKET, false, [ 1, 2, 3 ] ],
                [ PACKET, true, [ 4 ] ],
                [ SPAWN_GROUPS, false, [ ] ],
                [ FILE_INFO, false, [ ] ]
            ]);
        });
    });

    describe('When frames precede the tail', () => {
        test('It should point the offsets to the tail frames', async () => {
            const file = await write([ createFrame(PACKET, new Uint8Array(1000)), ...createTail() ]);
            const offsets = readOffsets(file);

            expect(offsets.spawnGroups).toBeGreaterThan(255);
            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When the tail frames are compressed', () => {
        test('It should still point the offsets to them', async () => {
            const file = await write([ createFrame(SPAWN_GROUPS | DemoPacketRaw.COMPRESSED_FLAG, new Uint8Array([ 1 ])), createFrame(FILE_INFO | DemoPacketRaw.COMPRESSED_FLAG, new Uint8Array([ 2 ])) ]);
            const offsets = readOffsets(file);

            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When a frame was read with a non-canonical header', () => {
        test('It should still point the offsets to the tail frames', async () => {
            const frame = new DemoPacketRaw(0, new VarInt32(PACKET, 2), DemoSource.REPLAY, new VarInt32(0), new VarInt32(3), new Uint8Array([ 1, 2, 3 ]));
            const file = await write([ frame, ...createTail() ]);
            const offsets = readOffsets(file);

            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When a tail frame is missing', () => {
        test('It should fail without DEM_FileInfo', async () => {
            await expect(write([ createFrame(SPAWN_GROUPS, EMPTY) ])).rejects.toThrow('DEM_FileInfo');
        });

        test('It should fail without DEM_SpawnGroups', async () => {
            await expect(write([ createFrame(FILE_INFO, EMPTY) ])).rejects.toThrow('DEM_SpawnGroups');
        });
    });
});
