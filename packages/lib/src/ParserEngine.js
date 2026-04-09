import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import Demo from '#data/Demo.js';

import DemoSource from '#data/enums/DemoSource.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import DemoStreamBufferSplitter from '#stream/DemoStreamBufferSplitter.js';
import DemoStreamEventLoopBreaker from '#stream/DemoStreamEventLoopBreaker.js';
import DemoStreamPacketAnalyzer from '#stream/DemoStreamPacketAnalyzer.js';
import DemoStreamPacketAnalyzerConcurrent from '#stream/DemoStreamPacketAnalyzerConcurrent.js';
import DemoStreamPacketBatcher from '#stream/DemoStreamPacketBatcher.js';
import DemoStreamPacketCoordinator from '#stream/DemoStreamPacketCoordinator.js';
import DemoStreamPacketExtractor from '#stream/DemoStreamPacketExtractor.js';
import DemoStreamPacketParser from '#stream/DemoStreamPacketParser.js';
import DemoStreamPacketParserConcurrent from '#stream/DemoStreamPacketParserConcurrent.js';
import DemoStreamPacketPrioritizer from '#stream/DemoStreamPacketPrioritizer.js';
import DemoStreamPacketResequencer from '#stream/DemoStreamPacketResequencer.js';

import MemoryTracker from '#trackers/MemoryTracker.js';
import PacketTracker from '#trackers/PacketTracker.js';
import PerformanceTracker from '#trackers/PerformanceTracker.js';

import WorkerRequestDemoClear from '#workers/requests/WorkerRequestDemoClear.js';
import WorkerManager from '#workers/WorkerManager.js';

import ParserConfiguration from './ParserConfiguration.js';

class ParserEngine {
    /**
     * @public
     * @param {ParserConfiguration} configuration
     * @param {Logger} logger
     */
    constructor(configuration, logger) {
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._configuration = configuration;
        this._logger = logger;

        this._demo = new Demo(logger);

        if (configuration.parserThreads === 0) {
            this._workerManager = null;
        } else {
            this._workerManager = new WorkerManager(configuration.parserThreads, logger);
        }

        this._interceptors = {
            pre: [
                [],
                [],
                []
            ],
            post: [
                [],
                [],
                []
            ]
        };

        this._trackers = {
            memory: new MemoryTracker(),
            packet: new PacketTracker(),
            performance: new PerformanceTracker()
        };

        this._disposed = false;
        this._finished = false;
        this._pipeline = null;
        this._started = false;
    }

    /**
     * @public
     * @returns {Demo}
     */
    get demo() {
        return this._demo;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get disposed() {
        return this._disposed;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get finished() {
        return this._finished;
    }

    /**
     * @public
     * @returns {{pre: *[], post: *[]}}
     */
    get interceptors() {
        return this._interceptors;
    }

    /**
     * @public
     * @returns {Logger}
     */
    get logger() {
        return this._logger;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get started() {
        return this._started;
    }

    /**
     * @public
     * @returns {WorkerManager|null}
     */
    get workerManager() {
        return this._workerManager;
    }

    /**
     * Aborts the currently running pipeline, if any.
     *
     * @public
     */
    abort() {
        if (this._pipeline !== null) {
            this._pipeline.abort();

            this._pipeline = null;
        }
    }

    /**
     * Disposes the engine, terminating workers and clearing all state.
     * After disposal, the engine cannot be used.
     *
     * @public
     * @returns {Promise<void>}
     */
    async dispose() {
        if (this._disposed) {
            return;
        }

        this._disposed = true;

        this.reset(true);

        if (this._workerManager !== null) {
            await this._workerManager.terminate();

            this._workerManager = null;
        }
    }

    /**
     * @public
     * @returns {MemoryTracker}
     */
    getMemoryTracker() {
        return this._trackers.memory;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsMultiThreaded() {
        return this._configuration.parserThreads > 0;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    getPacketTracker() {
        return this._trackers.packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    getPerformanceTracker() {
        return this._trackers.performance;
    }

    /**
     * @public
     * @returns {number}
     */
    getThreadsCount() {
        return this._configuration.parserThreads;
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    interceptPost(stage, ...args) {
        const interceptors = [...this._interceptors.post[stage.id]];

        for (let i = 0; i < interceptors.length; i++) {
            interceptors[i](...args);
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    interceptPre(stage, ...args) {
        const interceptors = [...this._interceptors.pre[stage.id]];

        for (let i = 0; i < interceptors.length; i++) {
            interceptors[i](...args);
        }
    }

    /**
     * Extracts raw packets from a demo stream without parsing them.
     * This is a lightweight first pass that only extracts {@link DemoPacketRaw} instances.
     *
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} source
     * @returns {Promise<Array<DemoPacketRaw>>}
     */
    async extract(reader, source) {
        await this._validateAndReset();

        const packets = [];

        const chain = [
            new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
            new DemoStreamPacketExtractor(this, source)
        ];

        this._started = true;
        this._finished = false;

        try {
            this._logger.info('Extract started');

            this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

            const collector = new WritableSink((packet) => packets.push(packet));

            this._pipeline = new Pipeline(reader, chain, collector);

            await this._pipeline.ready();

            this._logger.info(`Extracted [ ${packets.length} ] packets`);

            return packets;
        } catch (error) {
            this._logger.error('Extract failed', error);

            throw error;
        } finally {
            this._trackers.performance.end(PerformanceTrackerCategory.PARSER);

            this._finished = true;
            this._pipeline = null;
        }
    }

    /**
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @param {boolean} [objectMode=false]
     * @returns {Promise<void>}
     */
    async parse(reader, source = DemoSource.REPLAY, objectMode = false) {
        await this._validateAndReset();

        const chain = [];

        if (objectMode) {
            chain.push(new DemoStreamPacketResequencer(this));
        } else {
            chain.push(
                new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
                new DemoStreamPacketExtractor(this, source),
            );
        }

        chain.push(new DemoStreamEventLoopBreaker(this, this._configuration.breakInterval));

        if (this.getIsMultiThreaded()) {
            chain.push(
                new DemoStreamPacketBatcher(this, this._configuration.batcherChunkSize, this._configuration.batcherThresholdMilliseconds),
                new DemoStreamPacketParserConcurrent(this),
                new DemoStreamPacketCoordinator(this),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzerConcurrent(this)
            );
        } else {
            chain.push(
                new DemoStreamPacketParser(this),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzer(this)
            );
        }

        this._started = true;
        this._finished = false;

        try {
            this._logger.info('Parse started');

            this._trackers.memory.on();
            this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(reader, chain);

            await this._pipeline.ready();
        } catch (error) {
            if (error?.code !== 'ERR_STREAM_PREMATURE_CLOSE' && error?.name !== 'AbortError') {
                this._logger.error('Parse failed', error);
            }

            throw error;
        } finally {
            this._trackers.performance.end(PerformanceTrackerCategory.PARSER);
            this._trackers.memory.off();

            this._finished = true;
            this._pipeline = null;
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPostInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        this._interceptors.post[stage.id].push(interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPreInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        this._interceptors.pre[stage.id].push(interceptor);
    }

    /**
     * Resets the demo state. Optionally clears all interceptors.
     *
     * @public
     * @param {boolean} [interceptors=false]
     */
    reset(interceptors = false) {
        this.abort();

        this._demo.reset();

        if (interceptors) {
            this._interceptors.pre = [[], [], []];
            this._interceptors.post = [[], [], []];
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPostInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        const index = this._interceptors.post[stage.id].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._interceptors.post[stage.id].splice(index, 1);

        return true;
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPreInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        const index = this._interceptors.pre[stage.id].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._interceptors.pre[stage.id].splice(index, 1);

        return true;
    }

    /**
     * Validates that the engine can be used and resets state for a new run.
     *
     * @protected
     */
    async _validateAndReset() {
        if (this._disposed) {
            throw new Error(`Unable to run parser: engine has been disposed`);
        }

        if (this._started && !this._finished) {
            throw new Error(`Unable to run parser: engine is already running`);
        }

        this.reset();

        if (this._workerManager !== null) {
            await this._workerManager.broadcast(new WorkerRequestDemoClear());
        }
    }
}

export default ParserEngine;

