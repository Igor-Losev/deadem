import assert from 'node:assert';

import { Logger, InterceptorStage, Parser, ParserConfiguration, Printer } from 'deadem';

import Semaphore from 'deadem/src/core/Semaphore.js';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

/**
 * This script tests event consistency between single threaded and multithreaded
 * parsers.
 */
(async () => {
    const demoFile = DemoFile.REPLAY_36126420;

    const logger = Logger.CONSOLE_INFO;

    const parser1Configuration = new ParserConfiguration({ parserThreads: 0 });
    const parser2Configuration = new ParserConfiguration({ parserThreads: 4 });

    const parser1 = new Parser(parser1Configuration);
    const parser2 = new Parser(parser2Configuration);

    const printer1 = new Printer(parser1);
    const printer2 = new Printer(parser2);

    const [ readable1, readable2 ] = await Promise.all([ DemoProvider.read(demoFile), DemoProvider.read(demoFile) ]);

    const mutex1 = new Semaphore(0);
    const mutex2 = new Semaphore(0);

    const state1 = { s: null, d: null, m: null, e: null };
    const state2 = { s: null, d: null, m: null, e: null };

    const compare = () => {
        // Stage

        if (state1.s !== state2.s) {
            throw new Error(`DemoPacket stage difference: [ ${state1.s.code} ] [ ${state2.s.code} ]`);
        }

        // DemoPacket

        if (state1.d.tick !== state2.d.tick) {
            throw new Error(`DemoPacket tick difference: [ ${state1.d.tick} ] [ ${state2.d.tick} ]`);
        }

        if (state1.d.type !== state2.d.type) {
            throw new Error(`DemoPacket type difference: [ ${state1.d.type.code} ] [ ${state2.d.type.code} ]`);
        }

        if (state1.d.sequence !== state2.d.sequence) {
            throw new Error(`DemoPacket sequence difference: [ ${state1.d.sequence} ] [ ${state2.d.sequence} ]`);
        }

        // MessagePacket

        if (state1.s === InterceptorStage.MESSAGE_PACKET || state1.s === InterceptorStage.ENTITY_PACKET) {
            if (state1.m.type !== state2.m.type) {
                throw new Error(`MessagePacket type difference: [ ${state1.m.type.code} ] [ ${state2.m.type.code} ]`);
            }
        }

        // EntityPacket

        if (state1.s === InterceptorStage.ENTITY_PACKET) {
            if (state1.e.length !== state2.e.length) {
                throw new Error(`Entity events different length: [ ${state1.e.length} ] [ ${state2.e.length} ]`);
            }

            state1.e.forEach((event1, index) => {
                const event2 = state2.e[index];

                if (event1.operation !== event2.operation) {
                    throw new Error(`Entity events different operations: [ ${event1.operation.code} ] [ ${event2.operation.code} ]`);
                }

                if (event1.entity.index !== event2.entity.index) {
                    throw new Error(`Entity events different indexes: [ ${event1.entity.index} ] [ ${event2.entity.index} ]`);
                }

                if (event1.entity.class.id !== event2.entity.class.id) {
                    throw new Error(`Entity events different classes: [ ${event1.entity.class.id} ] [ ${event2.entity.class.id} ]`);
                }

                if (event1.mutations.length !== event2.mutations.length) {
                    throw new Error(`Entity events different mutations length: [ ${event1.mutations.length} ] [ ${event2.mutations.length} ]`);
                }

                event1.mutations.forEach((mutation1, mutationIndex) => {
                    const mutation2 = event2.mutations[mutationIndex];

                    if (mutation1.fieldPath.code !== mutation2.fieldPath.code) {
                        throw new Error(`Entity events different field path: [ ${mutation1.fieldPath.code} ] [ ${mutation2.fieldPath.code} ]`);
                    }

                    assert.deepStrictEqual(mutation1.value, mutation2.value);
                });
            });
        }
    };

    const clean = (state) => {
        state.s = null;
        state.d = null;
        state.m = null;
        state.e = null;
    };

    const getIsReady = state => state.s !== null;

    const getInterceptor = (stage, state1, state2, mutex1, mutex2) => async (demoPacket, messagePacket, events) => {
        state1.s = stage;
        state1.d = demoPacket;
        state1.m = messagePacket || null;
        state1.e = events || null;

        if (!getIsReady(state2)) {
            await wait(mutex1);
        } else {
            compare();

            clean(state1);
            clean(state2);

            mutex2.release();
        }
    };

    const wait = async (mutex) => {
        const promise = mutex.acquire();

        const timeoutId = setTimeout(() => {
            throw new Error('Timed out: mutex idle');
        }, 1000);

        await promise;

        clearTimeout(timeoutId);
    };

    const interceptor1Demo = getInterceptor(InterceptorStage.DEMO_PACKET, state1, state2, mutex1, mutex2);
    const interceptor1Message = getInterceptor(InterceptorStage.MESSAGE_PACKET, state1, state2, mutex1, mutex2);
    const interceptor1Entity = getInterceptor(InterceptorStage.ENTITY_PACKET, state1, state2, mutex1, mutex2);

    const interceptor2Demo = getInterceptor(InterceptorStage.DEMO_PACKET, state2, state1, mutex2, mutex1);
    const interceptor2Message = getInterceptor(InterceptorStage.MESSAGE_PACKET, state2, state1, mutex2, mutex1);
    const interceptor2Entity = getInterceptor(InterceptorStage.ENTITY_PACKET, state2, state1, mutex2, mutex1);

    parser1.registerPreInterceptor(InterceptorStage.DEMO_PACKET, interceptor1Demo);
    parser1.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor1Demo);
    parser1.registerPreInterceptor(InterceptorStage.MESSAGE_PACKET, interceptor1Message);
    parser1.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, interceptor1Message);
    parser1.registerPreInterceptor(InterceptorStage.ENTITY_PACKET, interceptor1Entity);
    parser1.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, interceptor1Entity);

    parser2.registerPreInterceptor(InterceptorStage.DEMO_PACKET, interceptor2Demo);
    parser2.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor2Demo);
    parser2.registerPreInterceptor(InterceptorStage.MESSAGE_PACKET, interceptor2Message);
    parser2.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, interceptor2Message);
    parser2.registerPreInterceptor(InterceptorStage.ENTITY_PACKET, interceptor2Entity);
    parser2.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, interceptor2Entity);

    await Promise.all([ parser1.parse(readable1), parser2.parse(readable2) ]);

    logger.info('--- Single thread results ---');

    printer1.printPerformanceStats();

    logger.info('--- Multithreaded results ---');

    printer2.printPerformanceStats();

    logger.info('Success');
})();
