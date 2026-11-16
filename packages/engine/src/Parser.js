/** @import SchemaRegistry from './schema/SchemaRegistry.js' */
/** @import { NodeReadable } from '#core/stream/Pipeline.js' */
/** @import { InterceptorMap, InterceptorPreStage } from './data/InterceptorRegistry.js' */

/** @import Demo from './data/Demo.js' */
/** @import DemoPacketRaw from './data/DemoPacketRaw.js' */

/** @import InterceptorStage from './data/enums/InterceptorStage.js' */

/** @import { MemoryTrackerStats } from './diagnostics/trackers/MemoryTracker.base.js' */
/** @import { PacketTrackerStats } from './diagnostics/trackers/PacketTracker.js' */
/** @import { PerformanceTrackerStats } from './diagnostics/trackers/PerformanceTracker.js' */

import Assert from './core/Assert.js';
import Logger from './core/Logger.js';
import PauseControl from './core/PauseControl.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import ParserConfiguration from './configurations/ParserConfiguration.js';

import DemoSource from './data/enums/DemoSource.js';
import InterceptorRegistry from './data/InterceptorRegistry.js';
import PerformanceTrackerCategory from './data/enums/PerformanceTrackerCategory.js';

import ParserDiagnostics from './diagnostics/ParserDiagnostics.js';

import DemoStreamBufferSplitter from './stream/DemoStreamBufferSplitter.js';
import DemoStreamEventLoopBreaker from './stream/DemoStreamEventLoopBreaker.js';
import DemoStreamPacketExtractor from './stream/DemoStreamPacketExtractor.js';
import DemoStreamPacketProcessor from './stream/DemoStreamPacketProcessor.js';

import DemoSession from './DemoSession.js';

/**
 * @template [M=unknown]
 */
class Parser {
    /** @private @type {ParserConfiguration} */
    _configuration;

    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {InterceptorRegistry} */
    _interceptors;

    /** @private @type {Pipeline|null} */
    _pipeline = null;

    /** @private @type {DemoSession} */
    _session;

    /** @private */
    _state = {
        disposed: false,
        finished: false,
        pause: new PauseControl(),
        started: false
    };

    /**
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {ParserConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(registry, configuration = ParserConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._configuration = configuration;

        const diagnostics = new ParserDiagnostics(registry, logger);
        const interceptors = new InterceptorRegistry(registry.getUserCommandDecoder() !== null);

        this._diagnostics = diagnostics;
        this._interceptors = interceptors;

        this._session = new DemoSession(registry, configuration, diagnostics, interceptors);
    }

    /**
     * Aborts the currently running pipeline, if any.
     *
     * @public
     * @returns {void}
     */
    abort() {
        this._validateAvailability();

        this._state.pause.release();

        if (this._pipeline !== null) {
            this._pipeline.abort();

            this._pipeline = null;
        }
    }

    /**
     * Disposes the parser, clearing all state.
     * After disposal, the parser cannot be used.
     *
     * @public
     * @returns {Promise<void>}
     */
    async dispose() {
        this._validateAvailability();

        this.abort();

        this._state.disposed = true;

        this._session.reset();
        this._interceptors.reset();
    }

    /**
     * Extracts raw packets from a demo stream without parsing them.
     * This is a lightweight pass that only extracts {@link DemoPacketRaw} objects.
     *
     * @deprecated Will be removed in the next major version.
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @returns {Promise<Array<DemoPacketRaw>>}
     */
    async extract(reader, source = DemoSource.REPLAY) {
        this._prepareRun();

        /** @type {Array<DemoPacketRaw>} */
        const packets = [ ];

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
        ];

        this._state.started = true;

        try {
            this._diagnostics.logger.info('Extract started');

            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain, new WritableSink((packet) => packets.push(packet)));

            await this._pipeline.ready();

            this._diagnostics.logger.info(`Extracted [ ${packets.length} ] packets`);

            return packets;
        } catch (error) {
            if (Pipeline.getIsAbortError(error)) {
                return packets;
            }

            this._diagnostics.logger.error('Extract failed', error);

            throw error;
        } finally {
            this._diagnostics.performance.end(PerformanceTrackerCategory.PARSER);

            this._state.finished = true;
            this._pipeline = null;
        }
    }

    /**
     * @public
     * @returns {Demo}
     */
    getDemo() {
        return this._session.demo;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsDisposed() {
        return this._state.disposed;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsFinished() {
        return this._state.finished;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsStarted() {
        return this._state.started;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsPaused() {
        return this._state.pause.getIsPaused();
    }

    /**
     * @public
     * @returns {{memory: MemoryTrackerStats, performance: PerformanceTrackerStats, packet: PacketTrackerStats}}
     */
    getStats() {
        return this._diagnostics.getStats();
    }

    /**
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @param {boolean} [objectMode=false] - Deprecated: reads already extracted {@link DemoPacketRaw}. Will be removed in the next major version.
     * @returns {Promise<void>}
     */
    async parse(reader, source = DemoSource.REPLAY, objectMode = false) {
        this._prepareRun();

        const chain = [ ];

        if (!objectMode) {
            chain.push(
                new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
                new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
            );
        }

        chain.push(
            new DemoStreamEventLoopBreaker(this._configuration),
            new DemoStreamPacketProcessor(this._configuration, this._session, this._state.pause)
        );

        this._state.started = true;

        try {
            this._diagnostics.logger.info('Parse started');

            this._diagnostics.memory.on();
            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain);

            await this._pipeline.ready();
        } catch (error) {
            if (Pipeline.getIsAbortError(error)) {
                return;
            }

            this._diagnostics.logger.error('Parse failed', error);

            throw error;
        } finally {
            this._diagnostics.performance.end(PerformanceTrackerCategory.PARSER);
            this._diagnostics.memory.off();

            this._state.finished = true;
            this._pipeline = null;
        }
    }

    /**
     * Pauses parsing after the current packet finishes processing.
     *
     * @public
     */
    pause() {
        this._validateAvailability();

        if (!this._state.started || this._state.finished) {
            throw new Error('Unable to pause: engine is not running');
        }

        this._state.pause.pause();
    }

    /**
     * @public
     * @template {keyof InterceptorMap} C
     * @param {InterceptorStage<C>} stage
     * @param {InterceptorMap<M>[C]} interceptor
     */
    registerPostInterceptor(stage, interceptor) {
        return this._interceptors.registerPost(stage, interceptor);
    }

    /**
     * @public
     * @template {InterceptorPreStage} C
     * @param {InterceptorStage<C>} stage
     * @param {InterceptorMap<M>[C]} interceptor
     */
    registerPreInterceptor(stage, interceptor) {
        return this._interceptors.registerPre(stage, interceptor);
    }

    /**
     * Resumes paused parsing.
     *
     * @public
     */
    resume() {
        this._validateAvailability();

        this._state.pause.resume();
    }

    /**
     * @public
     * @template {keyof InterceptorMap} C
     * @param {InterceptorStage<C>} stage
     * @param {InterceptorMap<M>[C]} interceptor
     * @returns {boolean}
     */
    unregisterPostInterceptor(stage, interceptor) {
        return this._interceptors.unregisterPost(stage, interceptor);
    }

    /**
     * @public
     * @template {InterceptorPreStage} C
     * @param {InterceptorStage<C>} stage
     * @param {InterceptorMap<M>[C]} interceptor
     * @returns {boolean}
     */
    unregisterPreInterceptor(stage, interceptor) {
        return this._interceptors.unregisterPre(stage, interceptor);
    }

    /**
     * @protected
     */
    _prepareRun() {
        this._validateAvailability();

        if (this._state.started && !this._state.finished) {
            throw new Error('Unable to run parser: engine is already running');
        }

        this._state.pause.release();

        this._session.reset();

        this._state.started = false;
        this._state.finished = false;
    }

    /**
     * Throws if the parser has been disposed.
     *
     * @protected
     */
    _validateAvailability() {
        if (this._state.disposed) {
            throw new Error('Parser is not available: engine has been disposed');
        }
    }
}

export default Parser;
