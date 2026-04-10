import assert from 'node:assert';

import { Logger, InterceptorStage, Parser, ParserConfiguration, Printer } from 'deadem';

import DeferredPromise from 'deadem/src/data/DeferredPromise.js';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

const BATCH_SIZE = 1000;

/**
 * This script tests event consistency between single threaded and multithreaded
 * parsers by pausing each engine every N demo packets and comparing batches.
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

    const batch1 = [];
    const batch2 = [];

    let compared = 0;
    let comparedMessages = 0;
    let comparedEntities = 0;

    const compareBatches = () => {
        if (batch1.length !== batch2.length) {
            throw new Error(`Batch size mismatch at #${compared}: [ ${batch1.length} ] [ ${batch2.length} ]`);
        }

        for (let b = 0; b < batch1.length; b++) {
            const p1 = batch1[b];
            const p2 = batch2[b];

            if (p1.d.tick !== p2.d.tick) {
                throw new Error(`DemoPacket tick difference at #${compared}: [ ${p1.d.tick} ] [ ${p2.d.tick} ]`);
            }

            if (p1.d.type !== p2.d.type) {
                throw new Error(`DemoPacket type difference at #${compared}: [ ${p1.d.type.code} ] [ ${p2.d.type.code} ]`);
            }

            if (p1.d.sequence !== p2.d.sequence) {
                throw new Error(`DemoPacket sequence difference at #${compared}: [ ${p1.d.sequence} ] [ ${p2.d.sequence} ]`);
            }

            if (p1.messages.length !== p2.messages.length) {
                throw new Error(`MessagePacket count difference at #${compared}: [ ${p1.messages.length} ] [ ${p2.messages.length} ]`);
            }

            for (let i = 0; i < p1.messages.length; i++) {
                const m1 = p1.messages[i];
                const m2 = p2.messages[i];

                if (m1.type !== m2.type) {
                    throw new Error(`MessagePacket type difference at #${compared}[${i}]: [ ${m1.type.code} ] [ ${m2.type.code} ]`);
                }

                comparedMessages++;

                if (m1.events === null && m2.events === null) {
                    continue;
                }

                if (m1.events.length !== m2.events.length) {
                    throw new Error(`Entity events length difference at #${compared}[${i}]: [ ${m1.events.length} ] [ ${m2.events.length} ]`);
                }

                comparedEntities += m1.events.length;

                for (let j = 0; j < m1.events.length; j++) {
                    const e1 = m1.events[j];
                    const e2 = m2.events[j];

                    if (e1.operation !== e2.operation) {
                        throw new Error(`Entity operation difference at #${compared}[${i}][${j}]: [ ${e1.operation.code} ] [ ${e2.operation.code} ]`);
                    }

                    if (e1.entity.index !== e2.entity.index) {
                        throw new Error(`Entity index difference at #${compared}[${i}][${j}]: [ ${e1.entity.index} ] [ ${e2.entity.index} ]`);
                    }

                    if (e1.entity.class.id !== e2.entity.class.id) {
                        throw new Error(`Entity class difference at #${compared}[${i}][${j}]: [ ${e1.entity.class.id} ] [ ${e2.entity.class.id} ]`);
                    }

                    if (e1.mutations.length !== e2.mutations.length) {
                        throw new Error(`Mutations length difference at #${compared}[${i}][${j}]: [ ${e1.mutations.length} ] [ ${e2.mutations.length} ]`);
                    }

                    for (let k = 0; k < e1.mutations.length; k++) {
                        if (e1.mutations[k].fieldPath.code !== e2.mutations[k].fieldPath.code) {
                            throw new Error(`Field path difference at #${compared}[${i}][${j}][${k}]: [ ${e1.mutations[k].fieldPath.code} ] [ ${e2.mutations[k].fieldPath.code} ]`);
                        }

                        assert.deepStrictEqual(e1.mutations[k].value, e2.mutations[k].value);
                    }
                }
            }

            compared++;
        }

        batch1.length = 0;
        batch2.length = 0;
    };

    let signal1 = new DeferredPromise();
    let signal2 = new DeferredPromise();

    const getCollector = (batch, parser, getSignal) => {
        let current = null;

        const preDemo = (demoPacket) => {
            current = { d: demoPacket, messages: [] };
        };

        const postDemo = () => {
            batch.push(current);

            if (batch.length >= BATCH_SIZE) {
                parser.pause();
                getSignal().resolve('paused');
            }
        };

        const postMessage = (demoPacket, messagePacket) => {
            current.messages.push({ type: messagePacket.type, events: null });
        };

        const postEntity = (demoPacket, messagePacket, events) => {
            current.messages[current.messages.length - 1].events = events;
        };

        return { preDemo, postDemo, postMessage, postEntity };
    };

    const c1 = getCollector(batch1, parser1, () => signal1);
    const c2 = getCollector(batch2, parser2, () => signal2);

    parser1.registerPreInterceptor(InterceptorStage.DEMO_PACKET, c1.preDemo);
    parser1.registerPostInterceptor(InterceptorStage.DEMO_PACKET, c1.postDemo);
    parser1.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, c1.postMessage);
    parser1.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, c1.postEntity);

    parser2.registerPreInterceptor(InterceptorStage.DEMO_PACKET, c2.preDemo);
    parser2.registerPostInterceptor(InterceptorStage.DEMO_PACKET, c2.postDemo);
    parser2.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, c2.postMessage);
    parser2.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, c2.postEntity);

    const parse1 = parser1.parse(readable1).then(() => {
        if (!signal1.fulfilled) signal1.resolve('finished');
    });

    const parse2 = parser2.parse(readable2).then(() => {
        if (!signal2.fulfilled) signal2.resolve('finished');
    });

    while (true) {
        const [ s1, s2 ] = await Promise.all([ signal1.promise, signal2.promise ]);

        if (s1 === 'finished' && s2 === 'finished') {
            break;
        }

        const lastTick = batch1[batch1.length - 1].d.tick;

        compareBatches();

        logger.info(`Compared ${compared} demo packets, ${comparedMessages} message packets, ${comparedEntities} entity events (tick ${lastTick})`);

        signal1 = new DeferredPromise();
        signal2 = new DeferredPromise();

        if (s1 === 'finished') {
            signal1.resolve('finished');
        } else {
            parse1.catch(() => {});
            parser1.resume();
        }

        if (s2 === 'finished') {
            signal2.resolve('finished');
        } else {
            parse2.catch(() => {});
            parser2.resume();
        }
    }

    await Promise.all([ parse1, parse2 ]);

    if (batch1.length > 0 || batch2.length > 0) {
        compareBatches();
    }

    logger.info('--- Single thread results ---');

    printer1.printPacketStats();

    logger.info('--- Multithreaded results ---');

    printer2.printPacketStats();

    logger.info(`Compared ${compared} demo packets, ${comparedMessages} message packets, ${comparedEntities} entity events`);

    await parser1.dispose();
    await parser2.dispose();
})();
