import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';

import Demo from '#data/Demo.js';

import DemoSource from '#data/enums/DemoSource.js';
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

import MemoryTracker from '#trackers/MemoryTracker.js';
import PacketTracker from '#trackers/PacketTracker.js';
import PerformanceTracker from '#trackers/PerformanceTracker.js';

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
                [ ],
                [ ],
                [ ]
            ],
            post: [
                [ ],
                [ ],
                [ ]
            ]
        };

        this._trackers = {
            memory: new MemoryTracker(),
            packet: new PacketTracker(),
            performance: new PerformanceTracker()
        };

        this._finished = false;
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
    async interceptPost(stage, ...args) {
        for (let i = 0; i < this._interceptors.post[stage.id].length; i++) {
            const interceptor = this._interceptors.post[stage.id][i];

            await interceptor(...args);
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    async interceptPre(stage, ...args) {
        for (let i = 0; i < this._interceptors.pre[stage.id].length; i++) {
            const interceptor = this._interceptors.pre[stage.id][i];

            await interceptor(...args);
        }
    }

    /**
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @returns {Promise<void>}
     */
    async parse(reader, source = DemoSource.REPLAY) {
        if (this._started) {
            throw new Error('Unable to parse: parser instance has already been used. Create a new instance to parse another demo');
        }

        let chain;

        if (this.getIsMultiThreaded()) {
            chain = [
                new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
                new DemoStreamPacketExtractor(this, source),
                new DemoStreamEventLoopBreaker(this, this._configuration.breakInterval),
                new DemoStreamPacketBatcher(this, this._configuration.batcherChunkSize, this._configuration.batcherThresholdMilliseconds),
                new DemoStreamPacketParserConcurrent(this),
                new DemoStreamPacketCoordinator(this),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzerConcurrent(this)
            ];
        } else {
            chain = [
                new DemoStreamBufferSplitter(this, this._configuration.splitterChunkSize),
                new DemoStreamPacketExtractor(this, source),
                new DemoStreamEventLoopBreaker(this, this._configuration.breakInterval),
                new DemoStreamPacketParser(this),
                new DemoStreamPacketPrioritizer(this),
                new DemoStreamPacketAnalyzer(this)
            ];
        }

        this._started = true;

        try {
            this._logger.info('Parse started');

            this._trackers.memory.on();
            this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

            const pipeline = new Pipeline(reader, chain);

            await pipeline.ready();
        } catch (error) {
            this._logger.error('Parse failed', error);

            throw error;
        } finally {
            this._trackers.performance.end(PerformanceTrackerCategory.PARSER);
            this._trackers.memory.off();

            this._finished = true;

            if (this._workerManager !== null) {
                await this._workerManager.terminate();
            }
        }
    }
}

export default ParserEngine;

