import { describe, expect, test } from 'vitest';

import DemoPacketType from '#data/enums/DemoPacketType.js';

import PacketCodec from '#src/PacketCodec.js';
import PlayerPacketIndex from '#src/PlayerPacketIndex.js';

/**
 * Creates a mock packet with the minimal interface required by PlayerPacketIndex.
 *
 * @param {number} tick
 * @param {number} [typeId=7] - DEM_Packet by default.
 */
function createPacket(tick, typeId = DemoPacketType.DEM_PACKET.id) {
    return {
        tick: { value: tick },
        getTypeId: () => typeId
    };
}

/**
 * Creates a codec stub that returns predetermined answers for each packet.
 *
 * @param {Map<object, {isBootstrap?: boolean, decoded?: *}>} answers
 */
function createCodec(answers = new Map()) {
    const stub = Object.create(PacketCodec.prototype);

    stub.getIsBootstrap = packet => answers.get(packet)?.isBootstrap === true;
    stub.decodeRaw = packet => answers.get(packet)?.decoded ?? null;

    return stub;
}

/**
 * Creates an index from a flat list of [tick, ...] values.
 * Each tick produces one DEM_Packet (typeId=7).
 */
function createIndex(ticks) {
    return new PlayerPacketIndex(createCodec(), ticks.map(t => createPacket(t)));
}

describe('PlayerPacketIndex', () => {
    describe('getTickPosition', () => {
        test('It should return the position of an existing tick', () => {
            const index = createIndex([ 100, 200, 200, 300 ]);

            expect(index.getTickPosition(100)).toBe(0);
            expect(index.getTickPosition(200)).toBe(1);
            expect(index.getTickPosition(300)).toBe(2);
        });

        test('It should return -1 for a non-existing tick', () => {
            const index = createIndex([ 100, 200, 300 ]);

            expect(index.getTickPosition(150)).toBe(-1);
            expect(index.getTickPosition(0)).toBe(-1);
            expect(index.getTickPosition(400)).toBe(-1);
        });
    });

    describe('advance', () => {
        test('It should return the next tick, count, and position', () => {
            const index = createIndex([ 100, 200, 200, 300 ]);

            const result = index.advance(0);

            expect(result).toEqual({ tick: 200, count: 2, position: 1 });
        });

        test('It should return correct count for single-packet tick', () => {
            const index = createIndex([ 100, 200, 300 ]);

            const result = index.advance(0);

            expect(result).toEqual({ tick: 200, count: 1, position: 1 });
        });

        test('It should return null at the last position', () => {
            const index = createIndex([ 100, 200, 300 ]);

            expect(index.advance(2)).toBe(null);
        });

        test('It should walk through all ticks sequentially', () => {
            const index = createIndex([ 10, 10, 20, 30, 30, 30, 40 ]);

            const ticks = [];
            let pos = 0;

            while (true) {
                const next = index.advance(pos);

                if (next === null) {
                    break;
                }

                ticks.push({ tick: next.tick, count: next.count });
                pos = next.position;
            }

            expect(ticks).toEqual([
                { tick: 20, count: 1 },
                { tick: 30, count: 3 },
                { tick: 40, count: 1 }
            ]);
        });
    });

    describe('retreat', () => {
        test('It should return the previous tick and position', () => {
            const index = createIndex([ 100, 200, 300 ]);

            const result = index.retreat(2);

            expect(result).toEqual({ tick: 200, position: 1 });
        });

        test('It should return null at position 0', () => {
            const index = createIndex([ 100, 200, 300 ]);

            expect(index.retreat(0)).toBe(null);
        });

        test('It should walk back through all ticks', () => {
            const index = createIndex([ 10, 20, 30, 40 ]);

            const ticks = [];
            let pos = 3;

            while (true) {
                const prev = index.retreat(pos);

                if (prev === null) {
                    break;
                }

                ticks.push(prev.tick);
                pos = prev.position;
            }

            expect(ticks).toEqual([ 30, 20, 10 ]);
        });
    });

    describe('advance + retreat roundtrip', () => {
        test('It should return to the original position', () => {
            const index = createIndex([ 100, 200, 300, 400 ]);

            const fwd = index.advance(1);
            const back = index.retreat(fwd.position);

            expect(back.position).toBe(1);
            expect(back.tick).toBe(200);
        });
    });

    describe('getPacketsForTick', () => {
        test('It should return packets for a given tick', () => {
            const packets = [
                createPacket(100, DemoPacketType.DEM_FULL_PACKET.id),
                createPacket(200),
                createPacket(200),
                createPacket(300)
            ];

            const stub = createCodec(new Map([
                [ packets[0], { decoded: { stringTable: 'snapshot0' } } ]
            ]));

            const index = new PlayerPacketIndex(stub, packets);

            const result = index.getPacketsForTick(200);

            expect(result.packets.length).toBeGreaterThan(0);
            expect(result.remaining.length).toBeGreaterThan(0);
        });
    });
});
