import { beforeEach, describe, expect, test, vi } from 'vitest';

import Player from '#src/Player.js';

import PlayerState from '#data/enums/PlayerState.js';

/**
 * Creates a loaded Player with mocked internals.
 * Simulates 3 ticks (100, 200, 300) with 1 packet each, at positions 0, 1, 2.
 */
function createLoadedPlayer() {
    const player = new Player();

    player._engine = {
        demo: { server: { tickInterval: 0.015625 } },
        dispose: vi.fn(async () => {}),
        registerPostInterceptor: vi.fn(),
        unregisterPostInterceptor: vi.fn()
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
        close: vi.fn(async () => {}),
        process: vi.fn(async () => player._ticks.current),
        seekToTick: vi.fn(async (tick) => tick)
    };

    player._state = PlayerState.LOADED;
    player._source = {};
    player._ticks = { current: 100, first: 100, last: 300, position: 0 };

    // Override seekToTick to avoid real ParserSession construction
    player.seekToTick = async (tick) => {
        if (player._state === PlayerState.PLAYING) {
            player._stopPlayback();
        }

        player._state = PlayerState.SEEKING;

        try {
            if (player._session !== null) {
                await player._session.close();
            }

            player._session = {
                close: vi.fn(async () => {}),
                process: vi.fn(async (_) => {
                    const next = player._index.advance(player._ticks.position);

                    return next ? next.tick : player._ticks.current;
                }),
                seekToTick: vi.fn(async (t) => t)
            };

            player._ticks.current = await player._session.seekToTick(tick);
            player._ticks.position = player._index.getTickPosition(player._ticks.current);
        } finally {
            player._state = PlayerState.LOADED;
        }
    };

    return player;
}

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = createLoadedPlayer();
    });

    describe('state validation', () => {
        test('It should throw on nextTick when not LOADED', async () => {
            player._state = PlayerState.IDLE;

            await expect(player.nextTick()).rejects.toThrow('player is IDLE');
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
    });

    describe('nextTick', () => {
        test('It should advance to the next tick', async () => {
            player._session.process.mockResolvedValue(200);

            const result = await player.nextTick();

            expect(result).toBe(true);
            expect(player.getCurrentTick()).toBe(200);
            expect(player._ticks.position).toBe(1);
        });

        test('It should return false at the last position', async () => {
            player._ticks.position = 2;

            const result = await player.nextTick();

            expect(result).toBe(false);
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

        test('It should return to LOADED state on error', async () => {
            player._session.close.mockRejectedValue(new Error('fail'));

            await expect(player.seekToTick(200)).rejects.toThrow('fail');

            expect(player.state).toBe(PlayerState.LOADED);
        });
    });

    describe('play', () => {
        test('It should resolve when reaching the end', async () => {
            let call = 0;

            player._session.process.mockImplementation(async () => {
                call++;

                if (call === 1) return 200;

                return 300;
            });

            await player.play(100000);

            expect(player.getCurrentTick()).toBe(300);
            expect(player.state).toBe(PlayerState.LOADED);
            expect(player._playback.deferred).not.toBe(null);
        });

        test('It should transition to PLAYING state', async () => {
            player._session.process.mockReturnValue(new Promise(() => {}));

            const promise = player.play();

            expect(player.state).toBe(PlayerState.PLAYING);

            player.pause();

            await expect(promise).rejects.toThrow('Playback interrupted');
        });
    });

    describe('pause', () => {
        test('It should reject the play promise', async () => {
            player._session.process.mockResolvedValue(200);

            const promise = player.play(1000);

            player.pause();

            await expect(promise).rejects.toThrow('Playback interrupted');
            expect(player.state).toBe(PlayerState.LOADED);
        });

        test('It should be a no-op when not playing', () => {
            player.pause();

            expect(player.state).toBe(PlayerState.LOADED);
        });
    });

    describe('stop', () => {
        test('It should reject the play promise and seek to the first tick', async () => {
            player._session.process.mockReturnValue(new Promise(() => {}));

            const promise = player.play();

            await player.stop();

            await expect(promise).rejects.toThrow('Playback interrupted');
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

        test('It should close the session and dispose the engine', async () => {
            const session = player._session;
            const engine = player._engine;

            await player.dispose();

            expect(session.close).toHaveBeenCalled();
            expect(engine.dispose).toHaveBeenCalled();
        });

        test('It should clear all state', async () => {
            await player.dispose();

            expect(player._index).toBe(null);
            expect(player._source).toBe(null);
            expect(player._session).toBe(null);
            expect(player._ticks.current).toBe(-1);
            expect(player._ticks.position).toBe(-1);
        });

        test('It should stop playback on dispose', async () => {
            player._session.process.mockResolvedValue(200);

            const promise = player.play(1000);

            await player.dispose();

            await expect(promise).rejects.toThrow('Playback interrupted');
        });
    });
});
