import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import DeferredPromise from '#data/DeferredPromise.js';
import Demo from '#data/Demo.js';

import DemoSource from '#data/enums/DemoSource.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import DemoEntityHandler from '#handlers/DemoEntityHandler.js';
import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';
import StringTableHandler from '#handlers/StringTableHandler.js';

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

import WorkerRequestBootstrap from '#workers/requests/WorkerRequestBootstrap.js';
import WorkerRequestDemoClear from '#workers/requests/WorkerRequestDemoClear.js';
import WorkerManager from '#workers/WorkerManager.js';

import PacketCodec from './PacketCodec.js';
import ParserConfiguration from './ParserConfiguration.js';
import SchemaRegistry from './SchemaRegistry.js';

class ParserEngine {
    /**
     * @public
     * @param {SchemaRegistry} registry
     * @param {ParserConfiguration} configuration
     * @param {Logger} logger
     */
    constructor(registry, configuration, logger) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._registry = registry;
        this._configuration = configuration;
        this._logger = logger;

        this._codec = new PacketCodec(registry);
        this._demo = new Demo();

        const stringTableHandler = new StringTableHandler(registry, this._demo.stringTableContainer, logger);

        this._handlers = {
            demoEntity: new DemoEntityHandler(this._demo),
            demoMessage: new DemoMessageHandler(registry, this._demo, stringTableHandler),
            demoPacket: new DemoPacketHandler(registry, this._demo, stringTableHandler),
            stringTable: new StringTableHandler(registry, this._demo.stringTableContainer, logger)
        };

        if (configuration.parserThreads === 0) {
            this._workerManager = null;
        } else {
            this._workerManager = new WorkerManager(configuration.parserThreads, logger);
        }

        this._interceptors = this._createInterceptors();

        this._trackers = {
            memory: new MemoryTracker(),
            packet: new PacketTracker(registry),
            performance: new PerformanceTracker()
        };

        this._disposed = false;
        this._finished = false;
        this._pipeline = null;
        this._started = false;

        this._workersBootstrapped = false;

        this._paused = false;
        this._pausePromise = null;
    }

    /**
     * @public
     * @returns {PacketCodec}
     */
    get codec() {
        return this._codec;
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
    get paused() {
        return this._paused;
    }

    /**
     * @public
     * @returns {DeferredPromise|null}
     */
    get pausePromise() {
        return this._pausePromise;
    }

    /**
     * @public
     * @returns {SchemaRegistry}
     */
    get registry() {
        return this._registry;
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
        this._validateAvailability();

        this._unpause();

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
        this._validateAvailability();

        this.abort();

        this._disposed = true;

        this._demo.reset();
        this._interceptors = this._createInterceptors();

        if (this._workerManager !== null) {
            await this._workerManager.terminate();

            this._workerManager = null;
        }
    }

    /**
     * @public
     * @returns {DemoEntityHandler}
     */
    getDemoEntityHandler() {
        return this._handlers.demoEntity;
    }

    /**
     * @public
     * @returns {DemoMessageHandler}
     */
    getDemoMessageHandler() {
        return this._handlers.demoMessage;
    }

    /**
     * @public
     * @returns {DemoPacketHandler}
     */
    getDemoPacketHandler() {
        return this._handlers.demoPacket;
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
     * @returns {MemoryTracker}
     */
    getMemoryTracker() {
        return this._trackers.memory;
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
     * @returns {StringTableHandler}
     */
    getStringTableHandler() {
        return this._handlers.stringTable;
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
        const interceptors = [ ...this._interceptors.post[stage.id] ];

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
        const interceptors = [ ...this._interceptors.pre[stage.id] ];

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
        await this._prepareRun();

        const packets = [];

        const chain = [
            new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
            new DemoStreamPacketExtractor(this, source)
        ];

        this._started = true;

        try {
            this._logger.info('Extract started');

            this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

            const collector = new WritableSink((packet) => packets.push(packet));

            this._pipeline = new Pipeline(reader, chain, collector);

            await this._pipeline.ready();

            this._logger.info(`Extracted [ ${packets.length} ] packets`);

            return packets;
        } catch (error) {
            if (this._isAbortError(error)) {
                return packets;
            }

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
        await this._prepareRun();

        const chain = [];
        const messagePacketFilter = this._configuration.getIsMessagePacketTypeAllowed.bind(this._configuration);

        if (objectMode) {
            chain.push(new DemoStreamPacketResequencer(this));
        } else {
            chain.push(
                new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
                new DemoStreamPacketExtractor(this, source)
            );
        }

        chain.push(new DemoStreamEventLoopBreaker(this, this._configuration.breakInterval));

        if (this.getIsMultiThreaded()) {
            chain.push(
                new DemoStreamPacketBatcher(this, this._configuration.batcherChunkSize, this._configuration.batcherThresholdMilliseconds),
                new DemoStreamPacketParserConcurrent(this, messagePacketFilter),
                new DemoStreamPacketCoordinator(this),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzerConcurrent(this)
            );
        } else {
            chain.push(
                new DemoStreamPacketParser(this, messagePacketFilter),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzer(this)
            );
        }

        this._started = true;

        try {
            this._logger.info('Parse started');

            this._trackers.memory.on();
            this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(reader, chain);

            await this._pipeline.ready();
        } catch (error) {
            if (this._getIsAbortError(error)) {
                return;
            }

            this._logger.error('Parse failed', error);

            throw error;
        } finally {
            this._trackers.performance.end(PerformanceTrackerCategory.PARSER);
            this._trackers.memory.off();

            this._finished = true;
            this._pipeline = null;
        }
    }

    /**
     * Pauses the pipeline after the current packet finishes processing.
     *
     * @public
     */
    pause() {
        this._validateAvailability();

        if (!this._started || this._finished) {
            throw new Error('Unable to pause: engine is not running');
        }

        if (this._paused) {
            throw new Error('Unable to pause: engine is already paused');
        }

        this._paused = true;
        this._pausePromise = new DeferredPromise();
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
     * Resumes a paused pipeline.
     *
     * @public
     */
    resume() {
        this._validateAvailability();

        if (!this._paused) {
            throw new Error('Unable to resume: engine is not paused');
        }

        this._unpause();
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
     * @protected
     */
    async _prepareRun() {
        this._validateAvailability();

        if (this._started && !this._finished) {
            throw new Error('Unable to run parser: engine is already running');
        }

        this._unpause();

        this._demo.reset();

        this._started = false;
        this._finished = false;

        if (this._workerManager !== null) {
            if (!this._workersBootstrapped) {
                const snapshot = this._registry.export();

                await this._workerManager.broadcast(new WorkerRequestBootstrap(snapshot));

                this._workersBootstrapped = true;
            }

            await this._workerManager.broadcast(new WorkerRequestDemoClear());
        }
    }

    /**
     * Resolves the pause promise and clears pause state.
     *
     * @protected
     */
    _unpause() {
        if (!this._paused) {
            return;
        }

        this._paused = false;
        this._pausePromise.resolve();
        this._pausePromise = null;
    }

    /**
     * Throws if the engine has been disposed.
     *
     * @protected
     */
    _validateAvailability() {
        if (this._disposed) {
            throw new Error('Parser is not available: engine has been disposed');
        }
    }

    /**
     * @private
     * @returns {{pre: Array[], post: Array[]}}
     */
    _createInterceptors() {
        return {
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
    }

    /**
     * @private
     * @param {Error} error
     * @returns {boolean}
     */
    _getIsAbortError(error) {
        return error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.name === 'AbortError';
    }
}

export default ParserEngine;
