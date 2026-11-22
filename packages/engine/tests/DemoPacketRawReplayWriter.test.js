import { describe, expect, test } from 'vitest';

import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';
import VarInt32 from '../src/data/VarInt32.js';

import DemoPacketRawReplayExtractor from '../src/extractors/DemoPacketRawReplayExtractor.js';

import DemoPacketRawReplayWriter from '../src/writers/DemoPacketRawReplayWriter.js';

const EMPTY = new Uint8Array(0);
const MAXIMUM_INT32 = 0x7FFFFFFF;
const PACKET = DemoPacketType.DEM_PACKET.id;

function createFrame(type, tick, payload) {
    return new DemoPacketRaw(0, new VarInt32(type), DemoSource.REPLAY, new VarInt32(tick), new VarInt32(payload.length), payload);
}

function readFrames(bytes) {
    return Array.from(new DemoPacketRawReplayExtractor(bytes).retrieve(0)).filter(frame => frame !== null);
}

function summarize(frame) {
    return [ frame.getTypeId(), frame.getIsCompressed(), frame.tick.value, Array.from(frame.payload) ];
}

function write(frames) {
    return new DemoPacketRawReplayWriter(frames).all();
}

describe('DemoPacketRawReplayWriter.all()', () => {
    describe('When several frames are written', () => {
        test('It should read them back in order, without the file header', () => {
            const bytes = write([ createFrame(PACKET, 1, new Uint8Array([ 1 ])), createFrame(PACKET, 2, new Uint8Array([ 2 ])) ]);

            expect(bytes[0]).toBe(PACKET);
            expect(readFrames(bytes).map(summarize)).toEqual([ [ PACKET, false, 1, [ 1 ] ], [ PACKET, false, 2, [ 2 ] ] ]);
        });
    });

    describe('When the tick is -1', () => {
        test('It should encode it as five bytes and read it back as an initial frame', () => {
            const bytes = write([ createFrame(DemoPacketType.DEM_FILE_HEADER.id, -1, EMPTY) ]);

            expect(Array.from(bytes)).toEqual([ 1, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F, 0 ]);
            expect(readFrames(bytes)[0].getIsInitial()).toBe(true);
        });
    });

    describe('When the tick is on the upper boundary', () => {
        test('It should read it back', () => {
            expect(readFrames(write([ createFrame(PACKET, MAXIMUM_INT32, EMPTY) ]))[0].tick.value).toBe(MAXIMUM_INT32);
        });
    });

    describe('When a frame was read with a non-canonical header', () => {
        test('It should write the header canonically', () => {
            const frame = new DemoPacketRaw(0, new VarInt32(PACKET, 2), DemoSource.REPLAY, new VarInt32(0), new VarInt32(0), EMPTY);

            expect(Array.from(write([ frame ]))).toEqual([ PACKET, 0, 0 ]);
        });
    });
});
