import { describe, expect, test } from 'vitest';

import InterceptorStage from '../src/data/enums/InterceptorStage.js';

import Parser from '../src/Parser.js';
import ParserConfiguration from '../src/ParserConfiguration.js';
import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import Logger from '../src/core/Logger.js';

import createDescriptors from './support/createDescriptors.js';

const registry = new SchemaRegistry(createDescriptors({ }));

function createParser() {
    return new Parser(registry, ParserConfiguration.DEFAULT, Logger.NOOP);
}

function createRunningParser() {
    const parser = createParser();

    parser._state.started = true;
    parser._state.finished = false;

    return parser;
}

describe('Parser', () => {
    describe('pause', () => {
        test('It should throw when not started', () => {
            const parser = createParser();

            expect(() => parser.pause()).toThrow('not running');
        });

        test('It should throw when finished', () => {
            const parser = createParser();

            parser._state.started = true;
            parser._state.finished = true;

            expect(() => parser.pause()).toThrow('not running');
        });

        test('It should throw when disposed', async () => {
            const parser = createParser();

            await parser.dispose();

            expect(() => parser.pause()).toThrow('disposed');
        });

        test('It should throw when already paused', () => {
            const parser = createRunningParser();

            parser.pause();

            expect(() => parser.pause()).toThrow('already paused');
        });

        test('It should set paused state and create the pause promise', () => {
            const parser = createRunningParser();

            parser.pause();

            expect(parser.getIsPaused()).toBe(true);
            expect(parser._state.pause.deferred).not.toBeNull();
        });
    });

    describe('resume', () => {
        test('It should throw when not paused', () => {
            const parser = createRunningParser();

            expect(() => parser.resume()).toThrow('not paused');
        });

        test('It should throw when disposed', async () => {
            const parser = createParser();

            await parser.dispose();

            expect(() => parser.resume()).toThrow('disposed');
        });

        test('It should clear paused state and resolve the pause promise', async () => {
            const parser = createRunningParser();

            parser.pause();

            const promise = parser._state.pause.deferred.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            parser.resume();

            await promise;

            expect(parser.getIsPaused()).toBe(false);
            expect(parser._state.pause.deferred).toBeNull();
            expect(resolved).toBe(true);
        });
    });

    describe('abort', () => {
        test('It should throw when disposed', async () => {
            const parser = createParser();

            await parser.dispose();

            expect(() => parser.abort()).toThrow('disposed');
        });

        test('It should not throw when not running', () => {
            const parser = createParser();

            expect(() => parser.abort()).not.toThrow();
        });

        test('It should resolve the pause promise on abort', async () => {
            const parser = createRunningParser();

            parser.pause();

            const promise = parser._state.pause.deferred.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            parser.abort();

            await promise;

            expect(resolved).toBe(true);
            expect(parser.getIsPaused()).toBe(false);
            expect(parser._state.pause.deferred).toBeNull();
        });

        test('It should stop parsing a web ReadableStream', async () => {
            const parser = createParser();
            const stream = new ReadableStream({ pull: () => new Promise(() => { }) });

            const parse = parser.parse(stream);

            await new Promise((resolve) => {
                setTimeout(resolve, 0);
            });

            expect(() => parser.abort()).not.toThrow();

            await expect(parse).resolves.toBeUndefined();
        });
    });

    describe('dispose', () => {
        test('It should throw when already disposed', async () => {
            const parser = createParser();

            await parser.dispose();

            await expect(async () => parser.dispose()).rejects.toThrow('disposed');
        });
    });

    describe('dispose while paused', () => {
        test('It should resolve the pause promise on dispose', async () => {
            const parser = createRunningParser();

            parser.pause();

            const promise = parser._state.pause.deferred.promise;

            let resolved = false;

            promise.then(() => { resolved = true; });

            await parser.dispose();

            await promise;

            expect(resolved).toBe(true);
        });
    });

    describe('pause and resume cycle', () => {
        test('It should allow re-pause after resume', () => {
            const parser = createRunningParser();

            parser.pause();
            parser.resume();

            parser.pause();

            expect(parser.getIsPaused()).toBe(true);
            expect(parser._state.pause.deferred).not.toBeNull();
        });
    });

    describe('registerPostInterceptor', () => {
        test('It should reject USER_COMMAND when the game registers no decoder', () => {
            const parser = createParser();

            expect(() => parser.registerPostInterceptor(InterceptorStage.USER_COMMAND, () => { })).toThrow('unsupported');
        });

        test('It should accept USER_COMMAND once a decoder is registered', () => {
            const supported = new SchemaRegistry(createDescriptors({ TestUserCmd: [ [ 'tick', 1, 'int32' ] ] }));

            supported.setUserCommandDecoder(supported.getDecoder('TestUserCmd'));

            const parser = new Parser(supported, ParserConfiguration.DEFAULT, Logger.NOOP);

            expect(() => parser.registerPostInterceptor(InterceptorStage.USER_COMMAND, () => { })).not.toThrow();
        });

        test('It should accept the other stages regardless of the decoder', () => {
            const parser = createParser();

            expect(() => parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, () => { })).not.toThrow();
        });
    });

    describe('registerPreInterceptor', () => {
        test('It should reject USER_COMMAND, which has no pre phase', () => {
            const parser = createParser();

            expect(() => parser.registerPreInterceptor(InterceptorStage.USER_COMMAND, () => { })).toThrow('no pre phase');
        });
    });
});
