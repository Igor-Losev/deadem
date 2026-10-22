import { beforeEach, describe, expect, test, vi } from 'vitest';

import Player from '../src/player/Player.js';
import SchemaRegistry from '../src/SchemaRegistry.js';

import PlaybackInterruptedError from '../src/errors/PlaybackInterruptedError.js';
import PlayerState from '../src/data/enums/PlayerState.js';

import createDescriptors from './support/createDescriptors.js';

const registry = new SchemaRegistry(createDescriptors({ }));

/**
 * Creates a loaded Player with mocked internals.
 * Simulates 3 ticks (100, 200, 300) with 1 packet each, at positions 0, 1, 2.
 */
function createLoadedPlayer() {
    const player = new Player(registry);

    player._engine = {
        demo: { server: { tickInterval: 0.015625 } },
        dispose: vi.fn(async () => {}),
        getMemoryTracker: vi.fn(() => ({ off: vi.fn(), on: vi.fn() }))
    };

    player._index = {
        advance: vi.fn((position) => {
            if (position === 0) return { tick: 200, count: 1, position: 1 };
            if (position === 1) return { tick: 300, count: 1, position: 2 };
            return null;
        }),
        retreat: vi.fn((position) => {
            if (position === 2) return { tick: 200, position: 1 };
            if (position === 1) return { tick: 100, position: 0 };
            return null;
        }),
        getTickPosition: vi.fn((tick) => {
            if (tick === 100) return 0;
            if (tick === 200) return 1;
            if (tick === 300) return 2;
            return -1;
        })
    };

    player._session = {
        abort: vi.fn(),
        process: vi.fn(() => [ 100, 200, 300 ][player._ticks.position]),
        seek: vi.fn(async (tick) => tick)
    };

    player._state = PlayerState.LOADED;
    player._ticks = { current: 100, first: 100, last: 300, position: 0 };

    return player;
}

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = createLoadedPlayer();
    });

    describe('state validation', () => {
        test('It should throw on nextTick when not LOADED', () => {
            player._state = PlayerState.IDLE;

            expect(() => player.nextTick()).toThrow('player is IDLE');
        });

        test('It should throw on prevTick when not LOADED', async () => {
            player._state = PlayerState.IDLE;

            await expect(player.prevTick()).rejects.toThrow('player is IDLE');
        });

        test('It should throw on play when not LOADED', () => {
            player._state = PlayerState.IDLE;

            expect(() => player.play()).toThrow();
        });

        test('It should throw on play when already PLAYING', () => {
            player._state = PlayerState.PLAYING;

            expect(() => player.play()).toThrow();
        });

        test('It should throw on play when rate is not positive', () => {
            expect(() => player.play(0)).toThrow();
            expect(() => player.play(-1)).toThrow();
        });
    });

    describe('nextTick', () => {
        test('It should advance to the next tick', () => {
            const result = player.nextTick();

            expect(result).toBe(true);
            expect(player.getCurrentTick()).toBe(200);
            expect(player._ticks.position).toBe(1);
        });

        test('It should return false at the last position', () => {
            player._ticks.position = 2;

            const result = player.nextTick();

            expect(result).toBe(false);
        });

        test('It should throw when session.process throws', () => {
            const error = new Error('processing failed');

            player._session.process.mockImplementation(() => {
                throw error;
            });

            expect(() => player.nextTick()).toThrow(error);
        });

        test('It should leave the player in LOADED state after a session failure', () => {
            player._session.process.mockImplementation(() => {
                throw new Error('processing failed');
            });

            expect(() => player.nextTick()).toThrow();

            expect(player.state).toBe(PlayerState.LOADED);
        });
    });

    describe('prevTick', () => {
        test('It should go back to the previous tick', async () => {
            player._ticks.current = 200;
            player._ticks.position = 1;

            await player.prevTick();

            expect(player.getCurrentTick()).toBe(100);
            expect(player._ticks.position).toBe(0);
        });

        test('It should return false at the first position', async () => {
            player._ticks.position = 0;

            const result = await player.prevTick();

            expect(result).toBe(false);
        });

        test('It should reject when the underlying seek fails', async () => {
            player._ticks.current = 200;
            player._ticks.position = 1;

            const error = new Error('seek failed');

            player._session.seek.mockRejectedValue(error);

            await expect(player.prevTick()).rejects.toBe(error);
            expect(player.state).toBe(PlayerState.LOADED);
        });
    });

    describe('seekToTick', () => {
        test('It should seek to the target tick', async () => {
            await player.seekToTick(200);

            expect(player.getCurrentTick()).toBe(200);
            expect(player._ticks.position).toBe(1);
        });

        test('It should return to LOADED state after seek', async () => {
            await player.seekToTick(200);

            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should return to LOADED state on seek error', async () => {
            player._session.seek.mockRejectedValue(new Error('fail'));

            await expect(player.seekToTick(200)).rejects.toThrow('fail');

            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should interrupt play with PAUSED reason when seeking while playing', async () => {
            const promise = player.play(0.001);

            await player.seekToTick(200);

            const err = await promise.catch(e => e);

            expect(err).toBeInstanceOf(PlaybackInterruptedError);
            expect(err.reason).toBe(PlaybackInterruptedError.PAUSED);
        });
    });

    describe('play', () => {
        test('It should resolve when reaching the end', async () => {
            await player.play(100000);

            expect(player.getCurrentTick()).toBe(300);
            expect(player.state).toBe(PlayerState.LOADED);
            expect(player._playback.loop).toBe(null);
        });

        test('It should transition to PLAYING state', async () => {
            const promise = player.play(0.001);

            expect(player.state).toBe(PlayerState.PLAYING);

            player.pause();

            const err = await promise.catch(e => e);

            expect(err).toBeInstanceOf(PlaybackInterruptedError);
            expect(err.reason).toBe(PlaybackInterruptedError.PAUSED);
        });

        test('It should reject the play promise when session.process throws mid-loop', async () => {
            const error = new Error('processing failed');
            let call = 0;

            player._session.process.mockImplementation(() => {
                call++;

                if (call === 1) return 200;

                throw error;
            });

            await expect(player.play(100000)).rejects.toBe(error);
            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should reject the play promise when session.process throws on first advance', async () => {
            const error = new Error('processing failed');

            player._session.process.mockImplementation(() => {
                throw error;
            });

            await expect(player.play(100000)).rejects.toBe(error);
            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should clear the playback loop after a processing error', async () => {
            player._session.process.mockImplementation(() => {
                throw new Error('processing failed');
            });

            await player.play(100000).catch(() => {});

            expect(player._playback.loop).toBe(null);
        });
    });

    describe('pause', () => {
        test('It should reject the play promise', async () => {
            const promise = player.play(0.001);

            player.pause();

            const err = await promise.catch(e => e);

            expect(err).toBeInstanceOf(PlaybackInterruptedError);
            expect(err.reason).toBe(PlaybackInterruptedError.PAUSED);
            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should be a no-op when not playing', () => {
            player.pause();

            expect(player.state).toBe(PlayerState.LOADED);
        });
    });

    describe('stop', () => {
        test('It should reject the play promise and seek to the first tick', async () => {
            const promise = player.play(0.001);

            await player.stop();

            const err = await promise.catch(e => e);

            expect(err).toBeInstanceOf(PlaybackInterruptedError);
            expect(err.reason).toBe(PlaybackInterruptedError.STOPPED);
            expect(player.getCurrentTick()).toBe(100);
        });

        test('It should be a no-op when not playing', async () => {
            await player.stop();

            expect(player.getCurrentTick()).toBe(100);
        });
    });

    describe('dispose', () => {
        test('It should transition to DISPOSED state', async () => {
            await player.dispose();

            expect(player.state).toBe(PlayerState.DISPOSED);
        });

        test('It should abort the session and dispose the engine', async () => {
            const session = player._session;
            const engine = player._engine;

            await player.dispose();

            expect(session.abort).toHaveBeenCalled();
            expect(engine.dispose).toHaveBeenCalled();
        });

        test('It should clear all state', async () => {
            await player.dispose();

            expect(player._index).toBe(null);
            expect(player._session).toBe(null);
            expect(player._ticks.current).toBe(-1);
            expect(player._ticks.position).toBe(-1);
        });

        test('It should stop playback on dispose', async () => {
            const promise = player.play(0.001);

            await player.dispose();

            const err = await promise.catch(e => e);

            expect(err).toBeInstanceOf(PlaybackInterruptedError);
            expect(err.reason).toBe(PlaybackInterruptedError.DISPOSED);
        });
    });
});
