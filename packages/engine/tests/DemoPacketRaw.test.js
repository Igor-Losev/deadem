import { describe, expect, test } from 'vitest';

import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';
import VarInt32 from '../src/data/VarInt32.js';

import DemoPacketRawReplayWriter from '../src/writers/DemoPacketRawReplayWriter.js';

const EMPTY = new Uint8Array(0);
const PACKET = DemoPacketType.DEM_PACKET.id;

function createFrame(type, tick, payload) {
    return new DemoPacketRaw(0, createVarInt(type), DemoSource.REPLAY, createVarInt(tick), createVarInt(payload.length), payload);
}

function createVarInt(value) {
    let size = 1;

    for (let remaining = value >>> 0; remaining >= 0x80; remaining = Math.floor(remaining / 0x80)) {
        size += 1;
    }

    return new VarInt32(value, size);
}

describe('DemoPacketRaw.getSize()', () => {
    describe('When header fields need different varint widths', () => {
        test.each([
            [ 'the tick -1', createFrame(DemoPacketType.DEM_FILE_HEADER.id, -1, EMPTY) ],
            [ 'a two-byte tick', createFrame(PACKET, 300, EMPTY) ],
            [ 'a two-byte size', createFrame(PACKET, 0, new Uint8Array(300)) ]
        ])('It should match the written length for %s', (_, frame) => {
            expect(frame.getSize()).toBe(new DemoPacketRawReplayWriter([ frame ]).all().length);
        });
    });

    describe('When a header field was read with a non-canonical size', () => {
        test('It should count the canonical size', () => {
            const frame = new DemoPacketRaw(0, new VarInt32(PACKET, 2), DemoSource.REPLAY, createVarInt(0), createVarInt(0), EMPTY);

            expect(frame.getSize()).toBe(3);
        });
    });
});
