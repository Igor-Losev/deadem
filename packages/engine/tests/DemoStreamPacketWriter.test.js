import Stream from 'node:stream';

import { describe, expect, test } from 'vitest';

import Pipeline from '../src/core/stream/Pipeline.node.js';
import WritableSink from '../src/core/stream/WritableSink.node.js';

import StreamConfiguration from '../src/configurations/StreamConfiguration.js';

import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';
import VarInt32 from '../src/data/VarInt32.js';

import DemoPacketRawReplayExtractor from '../src/extractors/DemoPacketRawReplayExtractor.js';

import DemoStreamPacketWriter from '../src/stream/DemoStreamPacketWriter.js';

const COMPRESSED_FLAG = 64;
const EMPTY = new Uint8Array(0);
const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const HEADER_SIZE_BYTES = 16;
const HIGH_WATER_MARK = 4;
const PACKET = DemoPacketType.DEM_PACKET.id;
const SPAWN_GROUPS = DemoPacketType.DEM_SPAWN_GROUPS.id;

function assemble(chunks, header) {
    const file = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));

    let position = 0;

    for (let i = 0; i < chunks.length; i++) {
        file.set(chunks[i], position);

        position += chunks[i].length;
    }

    file.set(header, 0);

    return file;
}

function createFrame(type, payload) {
    return new DemoPacketRaw(0, createVarInt(type), DemoSource.REPLAY, createVarInt(0), createVarInt(payload.length), payload);
}

function createTail() {
    return [ createFrame(SPAWN_GROUPS, EMPTY), createFrame(FILE_INFO, EMPTY) ];
}

function createVarInt(value) {
    let size = 1;

    for (let remaining = value >>> 0; remaining >= 0x80; remaining = Math.floor(remaining / 0x80)) {
        size += 1;
    }

    return new VarInt32(value, size);
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

async function run(frames, onWrite) {
    const writer = new DemoStreamPacketWriter(new StreamConfiguration({ streamHighWaterMark: HIGH_WATER_MARK }));

    await new Pipeline(Stream.Readable.from(frames, { objectMode: true }), [ writer ], new WritableSink(onWrite)).ready();

    return writer;
}

async function write(frames) {
    const chunks = [ ];
    const writer = await run(frames, (chunk) => {
        chunks.push(chunk);
    });

    return { chunks, header: writer.getHeader() };
}

describe('DemoStreamPacketWriter', () => {
    describe('When frames pass through', () => {
        test('It should produce a file that reads back once the final header is in place', async () => {
            const frames = [ createFrame(PACKET, new Uint8Array([ 1, 2, 3 ])), createFrame(PACKET | COMPRESSED_FLAG, new Uint8Array([ 4 ])), ...createTail() ];
            const { chunks, header } = await write(frames);
            const file = assemble(chunks, header);

            expect(new TextDecoder().decode(file.subarray(0, 8))).toBe('PBDEMS2\0');
            expect(readFrames(file).map(frame => [ frame.getTypeId(), frame.getIsCompressed(), Array.from(frame.payload) ])).toEqual([
                [ PACKET, false, [ 1, 2, 3 ] ],
                [ PACKET, true, [ 4 ] ],
                [ SPAWN_GROUPS, false, [ ] ],
                [ FILE_INFO, false, [ ] ]
            ]);
        });

        test('It should push the header first with zero offsets', async () => {
            const { chunks } = await write([ createFrame(PACKET, new Uint8Array(10)), ...createTail() ]);

            expect(chunks[0].length).toBe(HEADER_SIZE_BYTES);
            expect(Array.from(chunks[0].subarray(8))).toEqual([ 0, 0, 0, 0, 0, 0, 0, 0 ]);
        });

        test('It should push every frame as soon as it arrives', async () => {
            const { chunks } = await write([ createFrame(PACKET, new Uint8Array(10)), createFrame(PACKET, new Uint8Array(10)), ...createTail() ]);

            expect(chunks.map(chunk => chunk.length)).toEqual([ HEADER_SIZE_BYTES, 13, 13, 3, 3 ]);
        });
    });

    describe('When frames precede the tail', () => {
        test('It should point the final offsets to the tail frames', async () => {
            const { chunks, header } = await write([ createFrame(PACKET, new Uint8Array(1000)), ...createTail() ]);
            const file = assemble(chunks, header);
            const offsets = readOffsets(file);

            expect(offsets.spawnGroups).toBeGreaterThan(255);
            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When the tail frames are compressed', () => {
        test('It should still point the offsets to them', async () => {
            const { chunks, header } = await write([ createFrame(SPAWN_GROUPS | COMPRESSED_FLAG, new Uint8Array([ 1 ])), createFrame(FILE_INFO | COMPRESSED_FLAG, new Uint8Array([ 2 ])) ]);
            const file = assemble(chunks, header);
            const offsets = readOffsets(file);

            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When a frame was read with a non-canonical header', () => {
        test('It should still point the offsets to the tail frames', async () => {
            const frame = new DemoPacketRaw(0, new VarInt32(PACKET, 2), DemoSource.REPLAY, createVarInt(0), createVarInt(3), new Uint8Array([ 1, 2, 3 ]));
            const { chunks, header } = await write([ frame, ...createTail() ]);
            const file = assemble(chunks, header);
            const offsets = readOffsets(file);

            expect(readFrameAt(file, offsets.spawnGroups).getTypeId()).toBe(SPAWN_GROUPS);
            expect(readFrameAt(file, offsets.fileInfo).getTypeId()).toBe(FILE_INFO);
        });
    });

    describe('When the sink is asynchronous', () => {
        test('It should wait for every write', async () => {
            const frames = [ ...new Array(32).fill(null).map(() => createFrame(PACKET, new Uint8Array(4))), ...createTail() ];

            let active = 0;
            let maximumActive = 0;

            await run(frames, async () => {
                active += 1;
                maximumActive = Math.max(maximumActive, active);

                await new Promise((resolve) => {
                    setImmediate(resolve);
                });

                active -= 1;
            });

            expect(maximumActive).toBe(1);
        });
    });

    describe('When the sink fails', () => {
        test('It should reject the pipeline', async () => {
            const onWrite = async () => {
                throw new Error('Disk is full');
            };

            await expect(run([ createFrame(PACKET, new Uint8Array(4)), ...createTail() ], onWrite)).rejects.toThrow('Disk is full');
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
