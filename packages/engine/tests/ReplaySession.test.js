import { describe, expect, test, vi } from 'vitest';

import Logger from '../src/core/Logger.js';

import ParserConfiguration from '../src/ParserConfiguration.js';
import ParserEngine from '../src/ParserEngine.js';
import SchemaRegistry from '../src/SchemaRegistry.js';

import PlaybackLoop from '../src/player/PlaybackLoop.js';
import PlayerPacketIndex from '../src/player/PlayerPacketIndex.js';
import ReplaySession from '../src/player/ReplaySession.js';

import createDescriptors from './support/createDescriptors.js';

const registry = new SchemaRegistry(createDescriptors({ }));

const UNKNOWN_TYPE_ID = 200;

function createEngine() {
    return new ParserEngine(registry, ParserConfiguration.DEFAULT, Logger.NOOP);
}

function createRawPacket(tick) {
    return {
        ordinal: -1,
        tick: { value: tick },
        getTypeId: () => UNKNOWN_TYPE_ID
    };
}

function createIndexStub(packets, plan) {
    const stub = Object.create(PlayerPacketIndex.prototype);

    stub.getOrFail = vi.fn((index) => {
        const packet = packets[index];

        if (!packet) {
            throw new Error(`Packet not found at index [ ${index} ]`);
        }

        return packet;
    });

    stub.getSeekPlan = vi.fn(() => plan);

    Object.defineProperty(stub, 'length', { get: () => packets.length });

    return stub;
}

function createSession(packets, plan, breakInterval = 1000) {
    const engine = createEngine();
    const index = createIndexStub(packets, plan);
    const session = new ReplaySession(engine, index, () => true, breakInterval);

    return { engine, index, session };
}

describe('ReplaySession', () => {
    describe('constructor', () => {
        test('It should validate dependencies', () => {
            const engine = createEngine();
            const index = createIndexStub([], { bootstrap: [], snapshots: [], from: 0, to: 0 });

            expect(() => new ReplaySession({}, index, () => true, 1000)).toThrow('engine');
            expect(() => new ReplaySession(engine, {}, () => true, 1000)).toThrow('index');
            expect(() => new ReplaySession(engine, index, () => true, 0)).toThrow('breakInterval');
        });
    });

    describe('seek', () => {
        test('It should reset the demo, then replay bootstrap, snapshots and the packet range', async () => {
            const packets = [ createRawPacket(-1), createRawPacket(10), createRawPacket(20), createRawPacket(30) ];
            const plan = { bootstrap: [ 0 ], snapshots: [ { tables: [] } ], from: 1, to: 4 };

            const { engine, session } = createSession(packets, plan);

            const resetSpy = vi.spyOn(engine.demo, 'reset');
            const snapshotSpy = vi.spyOn(engine.getStringTableHandler(), 'extractSnapshot');
            const trackerSpy = vi.spyOn(engine.getPacketTracker(), 'handleDemoPacketRaw');

            const tick = await session.seek(30);

            expect(tick).toBe(30);
            expect(resetSpy).toHaveBeenCalledTimes(1);
            expect(trackerSpy).toHaveBeenCalledTimes(4);
            expect(snapshotSpy).toHaveBeenCalledTimes(1);
            expect(session.cursor).toBe(4);

            const bootstrapOrder = trackerSpy.mock.invocationCallOrder[0];
            const snapshotOrder = snapshotSpy.mock.invocationCallOrder[0];
            const firstRangeOrder = trackerSpy.mock.invocationCallOrder[1];

            expect(snapshotOrder).toBeGreaterThan(bootstrapOrder);
            expect(snapshotOrder).toBeLessThan(firstRangeOrder);
        });

        test('It should assign sequential ordinals starting from zero', async () => {
            const packets = [ createRawPacket(-1), createRawPacket(10), createRawPacket(20) ];
            const plan = { bootstrap: [ 0 ], snapshots: [], from: 1, to: 3 };

            const { session } = createSession(packets, plan);

            await session.seek(20);

            expect(packets.map(packet => packet.ordinal)).toEqual([ 0, 1, 2 ]);
        });

        test('It should reject when aborted', async () => {
            const packets = [ createRawPacket(10) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            session.abort();

            await expect(session.seek(10)).rejects.toThrow('aborted');
        });

        test('It should stop a seek in progress when aborted', async () => {
            const packets = [ createRawPacket(10), createRawPacket(20), createRawPacket(30), createRawPacket(40) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 4 };

            const { session } = createSession(packets, plan, 1);

            const promise = session.seek(40);

            session.abort();

            await expect(promise).rejects.toThrow('aborted');
        });
    });

    describe('process', () => {
        test('It should throw before the first seek', () => {
            const packets = [ createRawPacket(10) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            expect(() => session.process(1)).toThrow('has not been positioned');
        });

        test('It should advance the cursor and return the tick of the last processed packet', async () => {
            const packets = [ createRawPacket(10), createRawPacket(20), createRawPacket(30) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            await session.seek(10);

            expect(session.cursor).toBe(1);

            const tick = session.process(2);

            expect(tick).toBe(30);
            expect(session.cursor).toBe(3);
        });

        test('It should clamp processing at the end of the index', async () => {
            const packets = [ createRawPacket(10), createRawPacket(20) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            await session.seek(10);

            const tick = session.process(100);

            expect(tick).toBe(20);
            expect(session.cursor).toBe(2);
        });

        test('It should throw when aborted', async () => {
            const packets = [ createRawPacket(10), createRawPacket(20) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            await session.seek(10);

            session.abort();

            expect(() => session.process(1)).toThrow('aborted');
        });
    });

    describe('integration with PlaybackLoop', () => {
        test('It should drive ticks through the loop until the packets are exhausted', async () => {
            const packets = [ createRawPacket(10), createRawPacket(20), createRawPacket(30) ];
            const plan = { bootstrap: [], snapshots: [], from: 0, to: 1 };

            const { session } = createSession(packets, plan);

            const tick = await session.seek(10);

            const loop = new PlaybackLoop(() => {
                if (session.cursor >= packets.length) {
                    return null;
                }

                return session.process(1);
            }, tick, 0.001);

            await loop.run();

            expect(session.cursor).toBe(3);
        });
    });
});
