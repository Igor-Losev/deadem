import { describe, expect, test, vi } from 'vitest';

import ParserSession from '#src/ParserSession.js';

/**
 * Creates a mock engine that tracks post interceptors and can fire them.
 */
function createMockEngine() {
    const interceptors = [];

    return {
        stringTableHandler: {
            handleSnapshot: vi.fn()
        },
        abort: vi.fn(),
        parse: vi.fn(async () => {}),

        registerPostInterceptor(stage, fn) {
            interceptors.push(fn);
        },
        unregisterPostInterceptor(stage, fn) {
            const idx = interceptors.indexOf(fn);

            if (idx !== -1) {
                interceptors.splice(idx, 1);
            }

            return idx !== -1;
        },

        firePacket(demoPacket) {
            [ ...interceptors ].forEach(fn => fn(demoPacket));
        }
    };
}

/**
 * Creates a session and puts it into the started state with a mock reader.
 */
function createStartedSession() {
    const engine = createMockEngine();
    const index = {};
    const session = new ParserSession(engine, index, {});

    session._started = true;
    session._reader = { release: vi.fn() };

    return { engine, session };
}

describe('ParserSession', () => {
    describe('initial state', () => {
        test('It should not be started or closed', () => {
            const session = new ParserSession(createMockEngine(), {}, {});

            expect(session.started).toBe(false);
            expect(session.closed).toBe(false);
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

        test('It should unregister the interceptor after processing', async () => {
            const { engine, session } = createStartedSession();

            const promise = session.process(1);

            engine.firePacket({ tick: 100 });

            await promise;

            engine.firePacket({ tick: 200 });
            engine.firePacket({ tick: 300 });
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

            session._parsePromise = Promise.resolve();

            await session.close();

            expect(engine.abort).toHaveBeenCalledTimes(1);
            expect(session.closed).toBe(true);
        });

        test('It should swallow ERR_STREAM_PREMATURE_CLOSE', async () => {
            const { session } = createStartedSession();

            const error = new Error('stream closed');
            error.code = 'ERR_STREAM_PREMATURE_CLOSE';

            session._parsePromise = Promise.reject(error);

            await expect(session.close()).resolves.toBeUndefined();
        });

        test('It should swallow AbortError', async () => {
            const { session } = createStartedSession();

            const error = new Error('aborted');
            error.name = 'AbortError';

            session._parsePromise = Promise.reject(error);

            await expect(session.close()).resolves.toBeUndefined();
        });

        test('It should rethrow unexpected errors', async () => {
            const { session } = createStartedSession();

            session._parsePromise = Promise.reject(new Error('unexpected'));

            await expect(session.close()).rejects.toThrow('unexpected');
        });
    });
});
