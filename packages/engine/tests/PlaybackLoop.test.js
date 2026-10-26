import { describe, expect, test, vi } from 'vitest';

import PlaybackInterruptedError from '../src/errors/PlaybackInterruptedError.js';

import PlaybackLoop from '../src/player/PlaybackLoop.js';

function createAdvance(count, step = 1) {
    let tick = 0;
    let remaining = count;

    return vi.fn(() => {
        if (remaining === 0) {
            return null;
        }

        remaining -= 1;
        tick += step;

        return tick;
    });
}

describe('PlaybackLoop', () => {
    describe('constructor', () => {
        test('It should validate dependencies', () => {
            expect(() => new PlaybackLoop({}, 0, 1)).toThrow('advance');
            expect(() => new PlaybackLoop(() => null, 0.5, 1)).toThrow('startTick');
            expect(() => new PlaybackLoop(() => null, 0, 0)).toThrow('millisecondsPerTick');
            expect(() => new PlaybackLoop(() => null, 0, Infinity)).toThrow('millisecondsPerTick');
        });
    });

    describe('run', () => {
        test('It should resolve when there are no more ticks', async () => {
            const advance = createAdvance(3);
            const loop = new PlaybackLoop(advance, 0, 0.001);

            await loop.run();

            expect(advance).toHaveBeenCalledTimes(4);
        });

        test('It should pace by tick values, not by advances', async () => {
            const advance = createAdvance(10, 2);
            const loop = new PlaybackLoop(advance, 0, 10000);

            const promise = loop.run();

            loop.interrupt(PlaybackInterruptedError.PAUSED);

            await promise.catch(() => {});

            expect(advance).toHaveBeenCalledTimes(1);
            expect(advance).toHaveLastReturnedWith(2);
        });

        test('It should reject when advance throws', async () => {
            const error = new Error('processing failed');
            const loop = new PlaybackLoop(() => {
                throw error;
            }, 0, 1);

            await expect(loop.run()).rejects.toBe(error);
        });

        test('It should throw when started twice', async () => {
            const loop = new PlaybackLoop(createAdvance(1), 0, 0.001);

            await loop.run();

            await expect(loop.run()).rejects.toThrow('already been started');
        });
    });

    describe('interrupt', () => {
        test('It should reject with PlaybackInterruptedError when interrupted during sleep', async () => {
            const loop = new PlaybackLoop(createAdvance(Infinity), 0, 10000);

            const promise = loop.run();

            loop.interrupt(PlaybackInterruptedError.PAUSED);

            const error = await promise.catch(e => e);

            expect(error).toBeInstanceOf(PlaybackInterruptedError);
            expect(error.reason).toBe(PlaybackInterruptedError.PAUSED);
        });

        test('It should keep the first interruption reason', async () => {
            const loop = new PlaybackLoop(createAdvance(Infinity), 0, 10000);

            const promise = loop.run();

            loop.interrupt(PlaybackInterruptedError.PAUSED);
            loop.interrupt(PlaybackInterruptedError.STOPPED);

            const error = await promise.catch(e => e);

            expect(error.reason).toBe(PlaybackInterruptedError.PAUSED);
        });
    });
});
