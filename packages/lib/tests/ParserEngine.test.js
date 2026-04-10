import { describe, expect, test } from 'vitest';

import ParserEngine from '#src/ParserEngine.js';
import ParserConfiguration from '#src/ParserConfiguration.js';

import Logger from '#core/Logger.js';

function createEngine() {
    return new ParserEngine(ParserConfiguration.DEFAULT, Logger.NOOP);
}

function createRunningEngine() {
    const engine = createEngine();

    engine._started = true;
    engine._finished = false;

    return engine;
}

describe('ParserEngine', () => {
    describe('pause', () => {
        test('It should throw when not started', () => {
            const engine = createEngine();

            expect(() => engine.pause()).toThrow('not running');
        });

        test('It should throw when finished', () => {
            const engine = createEngine();

            engine._started = true;
            engine._finished = true;

            expect(() => engine.pause()).toThrow('not running');
        });

        test('It should throw when disposed', async () => {
            const engine = createEngine();

            await engine.dispose();

            expect(() => engine.pause()).toThrow('disposed');
        });

        test('It should throw when already paused', () => {
            const engine = createRunningEngine();

            engine.pause();

            expect(() => engine.pause()).toThrow('already paused');
        });

        test('It should set paused state and create pausePromise', () => {
            const engine = createRunningEngine();

            engine.pause();

            expect(engine.paused).toBe(true);
            expect(engine.pausePromise).not.toBeNull();
        });
    });

    describe('resume', () => {
        test('It should throw when not paused', () => {
            const engine = createRunningEngine();

            expect(() => engine.resume()).toThrow('not paused');
        });

        test('It should throw when disposed', async () => {
            const engine = createEngine();

            await engine.dispose();

            expect(() => engine.resume()).toThrow('disposed');
        });

        test('It should clear paused state and resolve pausePromise', async () => {
            const engine = createRunningEngine();

            engine.pause();

            const promise = engine.pausePromise.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            engine.resume();

            await promise;

            expect(engine.paused).toBe(false);
            expect(engine.pausePromise).toBeNull();
            expect(resolved).toBe(true);
        });
    });

    describe('reset while paused', () => {
        test('It should resolve pausePromise on reset', async () => {
            const engine = createRunningEngine();

            engine.pause();

            const promise = engine.pausePromise.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            await engine.reset();

            await promise;

            expect(resolved).toBe(true);
            expect(engine.paused).toBe(false);
            expect(engine.pausePromise).toBeNull();
        });
    });

    describe('dispose while paused', () => {
        test('It should resolve pausePromise on dispose', async () => {
            const engine = createRunningEngine();

            engine.pause();

            const promise = engine.pausePromise.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            await engine.dispose();

            await promise;

            expect(resolved).toBe(true);
        });
    });

    describe('dispose', () => {
        test('It should throw when already disposed', async () => {
            const engine = createEngine();

            await engine.dispose();

            await expect(async () => engine.dispose()).rejects.toThrow('disposed');
        });
    });
});
