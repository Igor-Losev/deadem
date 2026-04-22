import { describe, expect, test, vi } from 'vitest';

import DeferredPromise from '#data/DeferredPromise.js';

import ParserSession from '#src/ParserSession.js';

/**
 * Creates a mock engine that:
 * - tracks post interceptors in insertion order,
 * - returns a controlled parse promise that can be failed/completed on demand,
 * - exposes firePacket() to simulate pipeline-driven interceptor invocations.
 */
function createMockEngine() {
    const interceptors = new Set();
    const parseDeferred = new DeferredPromise();

    parseDeferred.promise.catch(() => {
        // The ParserSession attaches its own handler; swallow unhandled rejections at test setup time
    });

    return {
        _parseDeferred: parseDeferred,
        _stringTableHandler: { handleSnapshot: vi.fn() },

        abort: vi.fn(),
        parse: vi.fn(() => parseDeferred.promise),

        getStringTableHandler() {
            return this._stringTableHandler;
        },

        registerPostInterceptor(_stage, fn) {
            interceptors.add(fn);
        },

        unregisterPostInterceptor(_stage, fn) {
            const existed = interceptors.has(fn);

            interceptors.delete(fn);

            return existed;
        },

        getInterceptorCount() {
            return interceptors.size;
        },

        firePacket(demoPacket) {
            [ ...interceptors ].forEach(fn => fn(demoPacket));
        },

        failParse(error) {
            parseDeferred.reject(error);
        },

        completeParse() {
            parseDeferred.resolve();
        }
    };
}

/**
 * Puts a ParserSession directly into the started state with the
 * error plumbing wired up as if seekToTick had already been called.
 * Useful for testing process/release/close in isolation.
 */
function createStartedSession() {
    const engine = createMockEngine();
    const session = new ParserSession(engine, {}, {});

    session._started = true;
    session._reader = { release: vi.fn() };
    session._parsePromise = engine._parseDeferred.promise;
    session._parsePromise.catch((error) => session._onParseError(error));

    return { engine, session };
}

/**
 * Creates a ParserSession with an index stubbed for a single seekToTick call.
 */
function createSeekableSession({ bootstrap, packets, remaining = [], snapshots = [] }) {
    const engine = createMockEngine();
    const index = {
        getPacketsForTick: vi.fn(() => ({
            bootstrap,
            stringTableSnapshots: snapshots,
            packets,
            remaining
        }))
    };
    const session = new ParserSession(engine, index, {});

    return { engine, index, session };
}

describe('ParserSession', () => {
    describe('initial state', () => {
        test('It should not be started, closed or errored', () => {
            const session = new ParserSession(createMockEngine(), {}, {});

            expect(session.started).toBe(false);
            expect(session.closed).toBe(false);
            expect(session.error).toBe(null);
        });
    });

    describe('process', () => {
        test('It should throw if not started', () => {
            const session = new ParserSession(createMockEngine(), {}, {});

            expect(() => session.process(1)).toThrow('Session has not been started');
        });

        test('It should throw if closed', () => {
            const { session } = createStartedSession();

            session._closed = true;

            expect(() => session.process(1)).toThrow('Session has been closed');
        });

        test('It should reject immediately if session is already errored', async () => {
            const { session } = createStartedSession();
            const error = new Error('earlier failure');

            session._error = error;

            await expect(session.process(1)).rejects.toBe(error);
        });

        test('It should release the specified number of packets', () => {
            const { session } = createStartedSession();

            session.process(3);

            expect(session._reader.release).toHaveBeenCalledTimes(3);
        });

        test('It should resolve with the tick of the last processed packet', async () => {
            const { engine, session } = createStartedSession();

            const promise = session.process(2);

            engine.firePacket({ tick: 100 });
            engine.firePacket({ tick: 200 });

            await expect(promise).resolves.toBe(200);
        });

        test('It should unregister the interceptor after resolving', async () => {
            const { engine, session } = createStartedSession();

            const promise = session.process(1);

            engine.firePacket({ tick: 100 });

            await promise;

            expect(engine.getInterceptorCount()).toBe(0);
        });

        test('It should reject if parse fails before enough packets are processed', async () => {
            const { engine, session } = createStartedSession();
            const error = new Error('parse failed');

            const promise = session.process(2);

            engine.failParse(error);

            await expect(promise).rejects.toBe(error);
        });

        test('It should unregister the interceptor on rejection', async () => {
            const { engine, session } = createStartedSession();

            const promise = session.process(2);

            expect(engine.getInterceptorCount()).toBe(1);

            engine.failParse(new Error('boom'));

            await promise.catch(() => {});

            expect(engine.getInterceptorCount()).toBe(0);
        });

        test('It should latch the error onto the session', async () => {
            const { engine, session } = createStartedSession();
            const error = new Error('boom');

            const promise = session.process(2);

            engine.failParse(error);

            await promise.catch(() => {});

            expect(session.error).toBe(error);
        });

        test('It should ignore abort errors and not latch them', async () => {
            const { engine, session } = createStartedSession();

            const premature = new Error('stream closed');

            premature.code = 'ERR_STREAM_PREMATURE_CLOSE';

            engine.failParse(premature);
  
            await Promise.resolve(); // microtask flush 

            expect(session.error).toBe(null);
        });
    });

    describe('release', () => {
        test('It should throw if not started', () => {
            const session = new ParserSession(createMockEngine(), {}, {});

            expect(() => session.release()).toThrow('Session has not been started');
        });

        test('It should throw if closed', () => {
            const { session } = createStartedSession();

            session._closed = true;

            expect(() => session.release()).toThrow('Session has been closed');
        });

        test('It should throw the latched error if session is errored', () => {
            const { session } = createStartedSession();
            const error = new Error('earlier failure');

            session._error = error;

            expect(() => session.release()).toThrow('earlier failure');
        });

        test('It should release one packet by default', () => {
            const { session } = createStartedSession();

            session.release();

            expect(session._reader.release).toHaveBeenCalledTimes(1);
        });

        test('It should release the specified number of packets', () => {
            const { session } = createStartedSession();

            session.release(5);

            expect(session._reader.release).toHaveBeenCalledTimes(5);
        });
    });

    describe('close', () => {
        test('It should be a no-op if already closed', async () => {
            const { engine, session } = createStartedSession();

            engine.completeParse();

            await session.close();
            await session.close();

            expect(engine.abort).toHaveBeenCalledTimes(1);
        });

        test('It should not abort if not started', async () => {
            const engine = createMockEngine();
            const session = new ParserSession(engine, {}, {});

            await session.close();

            expect(engine.abort).not.toHaveBeenCalled();
            expect(session.closed).toBe(true);
        });

        test('It should abort the engine and await parse promise', async () => {
            const { engine, session } = createStartedSession();

            engine.completeParse();

            await session.close();

            expect(engine.abort).toHaveBeenCalledTimes(1);
            expect(session.closed).toBe(true);
        });

        test('It should swallow ERR_STREAM_PREMATURE_CLOSE', async () => {
            const { engine, session } = createStartedSession();

            const error = new Error('stream closed');
            error.code = 'ERR_STREAM_PREMATURE_CLOSE';

            engine.failParse(error);

            await expect(session.close()).resolves.toBeUndefined();
        });

        test('It should swallow AbortError', async () => {
            const { engine, session } = createStartedSession();

            const error = new Error('aborted');
            error.name = 'AbortError';

            engine.failParse(error);

            await expect(session.close()).resolves.toBeUndefined();
        });

        test('It should rethrow unexpected errors when session was not previously errored', async () => {
            const session = new ParserSession(createMockEngine(), {}, {});

            session._started = true;
            session._parsePromise = Promise.reject(new Error('unexpected'));

            await expect(session.close()).rejects.toThrow('unexpected');
        });

        test('It should not rethrow errors that were already surfaced via _error', async () => {
            const { engine, session } = createStartedSession();

            const processPromise = session.process(2);

            engine.failParse(new Error('boom'));

            // Let the error propagate to pending operations first
            await processPromise.catch(() => {});

            // Now close should see _error set and swallow
            await expect(session.close()).resolves.toBeUndefined();
        });
    });

    describe('seekToTick', () => {
        test('It should throw if already started', async () => {
            const { session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 0 } ],
                packets: []
            });

            session._started = true;

            await expect(session.seekToTick(0)).rejects.toThrow('Session has already been started');
        });

        test('It should throw if closed', async () => {
            const { session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 0 } ],
                packets: []
            });

            session._closed = true;

            await expect(session.seekToTick(0)).rejects.toThrow('Session has been closed');
        });

        test('It should apply stringTableSnapshots when bootstrap completes', async () => {
            const snapshotA = { name: 'A' };
            const snapshotB = { name: 'B' };

            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 } ],
                snapshots: [ snapshotA, snapshotB ]
            });

            const promise = session.seekToTick(20);

            engine.firePacket({ sequence: 1, tick: 10 });
            engine.firePacket({ sequence: 2, tick: 20 });

            await expect(promise).resolves.toBe(20);

            expect(engine._stringTableHandler.handleSnapshot).toHaveBeenCalledWith(snapshotA);
            expect(engine._stringTableHandler.handleSnapshot).toHaveBeenCalledWith(snapshotB);
        });

        test('It should resolve with the tick of the last processed packet', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 }, { sequence: 2, tick: 15 } ],
                packets: [ { sequence: 3, tick: 25 } ]
            });

            const promise = session.seekToTick(25);

            engine.firePacket({ sequence: 1, tick: 10 });
            engine.firePacket({ sequence: 2, tick: 15 });
            engine.firePacket({ sequence: 3, tick: 25 });

            await expect(promise).resolves.toBe(25);
        });

        test('It should reject if parse fails before bootstrap processing completes', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 } ]
            });

            const error = new Error('parse failed');
            const promise = session.seekToTick(20);

            engine.failParse(error);

            await expect(promise).rejects.toBe(error);
        });

        test('It should reject if parse fails mid-stream after bootstrap', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 }, { sequence: 3, tick: 30 } ]
            });

            const promise = session.seekToTick(30);

            engine.firePacket({ sequence: 1, tick: 10 });
            engine.firePacket({ sequence: 2, tick: 20 });

            const error = new Error('mid-stream failure');

            engine.failParse(error);

            await expect(promise).rejects.toBe(error);
        });

        test('It should unregister both interceptors on error', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 } ]
            });

            const promise = session.seekToTick(20);

            expect(engine.getInterceptorCount()).toBe(2);

            engine.failParse(new Error('boom'));

            await promise.catch(() => {});

            expect(engine.getInterceptorCount()).toBe(0);
        });

        test('It should unregister interceptors on successful completion', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 } ]
            });

            const promise = session.seekToTick(20);

            engine.firePacket({ sequence: 1, tick: 10 });
            engine.firePacket({ sequence: 2, tick: 20 });

            await promise;

            expect(engine.getInterceptorCount()).toBe(0);
        });

        test('It should allow close() to complete cleanly after parse failure', async () => {
            const { engine, session } = createSeekableSession({
                bootstrap: [ { sequence: 1, tick: 10 } ],
                packets: [ { sequence: 2, tick: 20 } ]
            });

            const seekPromise = session.seekToTick(20);

            engine.failParse(new Error('boom'));

            await seekPromise.catch(() => {});

            await expect(session.close()).resolves.toBeUndefined();

            expect(session.closed).toBe(true);
            expect(session.error).toBeInstanceOf(Error);
        });
    });
});
