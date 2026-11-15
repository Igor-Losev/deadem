/** @import { NodeReadable } from '#core/stream/Pipeline.js' */

/** @import DemoPacketRaw from './data/DemoPacketRaw.js' */

import Assert from './core/Assert.js';
import Logger from './core/Logger.js';
import PauseControl from './core/PauseControl.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import Demo from './data/Demo.js';

import DemoSource from './data/enums/DemoSource.js';
import PerformanceTrackerCategory from './data/enums/PerformanceTrackerCategory.js';

import MemoryTracker from '#diagnostics/trackers/MemoryTracker.js';
import PacketTracker from './diagnostics/trackers/PacketTracker.js';
import ParserDiagnostics from './diagnostics/ParserDiagnostics.js';
import PerformanceTracker from './diagnostics/trackers/PerformanceTracker.js';

import DemoEntityHandler from './handlers/DemoEntityHandler.js';
import DemoMessageHandler from './handlers/DemoMessageHandler.js';
import DemoPacketHandler from './handlers/DemoPacketHandler.js';
import StringTableHandler from './handlers/StringTableHandler.js';

import DemoPacketApplier from './processing/DemoPacketApplier.js';
import DemoPacketParser from './processing/DemoPacketParser.js';
import DemoPacketPrioritizer from './processing/DemoPacketPrioritizer.js';
import DemoPacketProcessor from './processing/DemoPacketProcessor.js';
import InterceptorRegistry from './processing/InterceptorRegistry.js';

import PacketCodec from './schema/PacketCodec.js';
import SchemaRegistry from './schema/SchemaRegistry.js';

import DemoStreamBufferSplitter from './stream/DemoStreamBufferSplitter.js';
import DemoStreamEventLoopBreaker from './stream/DemoStreamEventLoopBreaker.js';
import DemoStreamPacketExtractor from './stream/DemoStreamPacketExtractor.js';
import DemoStreamPacketProcessor from './stream/DemoStreamPacketProcessor.js';

import ParserConfiguration from './ParserConfiguration.js';

class ParserEngine {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {ParserConfiguration} */
    _configuration;

    /** @private @type {Demo} */
    _demo;

    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {{ demoEntity: DemoEntityHandler, demoMessage: DemoMessageHandler, demoPacket: DemoPacketHandler, stringTable: StringTableHandler }} */
    _handlers;

    /** @private @type {InterceptorRegistry} */
    _interceptors;

    /** @private @type {Pipeline|null} */
    _pipeline = null;

    /** @private @type {DemoPacketProcessor} */
    _processor;

    /** @private */
    _state = {
        disposed: false,
        finished: false,
        pause: new PauseControl(),
        started: false
    };

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

        this._configuration = configuration;

        this._codec = new PacketCodec(registry);
        this._demo = new Demo();

        this._diagnostics = new ParserDiagnostics(logger, new MemoryTracker(), new PacketTracker(registry), new PerformanceTracker());

        const stringTableHandler = new StringTableHandler(registry, this._demo.stringTableContainer, logger);

        this._handlers = {
            demoEntity: new DemoEntityHandler(this._demo),
            demoMessage: new DemoMessageHandler(registry, this._demo, stringTableHandler, configuration.entityClassFilter),
            demoPacket: new DemoPacketHandler(registry, this._demo, stringTableHandler),
            stringTable: stringTableHandler
        };

        this._interceptors = new InterceptorRegistry(registry.getUserCommandDecoder() !== null);

        this._processor = new DemoPacketProcessor(
            new DemoPacketParser(configuration, this._diagnostics, this._codec),
            new DemoPacketPrioritizer(this._diagnostics),
            new DemoPacketApplier(this._diagnostics, this._handlers.demoPacket, this._handlers.demoMessage, this._handlers.demoEntity, this._interceptors)
        );
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
        return this._state.disposed;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get finished() {
        return this._state.finished;
    }

    /**
     * @public
     * @returns {InterceptorRegistry}
     */
    get interceptors() {
        return this._interceptors;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get paused() {
        return this._state.pause.paused;
    }

    /**
     * @public
     * @returns {DemoPacketProcessor}
     */
    get processor() {
        return this._processor;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get started() {
        return this._state.started;
    }

    /**
     * Aborts the currently running pipeline, if any.
     *
     * @public
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
     * Disposes the engine, clearing all state.
     * After disposal, the engine cannot be used.
     *
     * @public
     * @returns {Promise<void>}
     */
    async dispose() {
        this._validateAvailability();

        this.abort();

        this._state.disposed = true;

        this._demo.reset();
        this._interceptors.reset();
    }

    /**
     * @public
     * @returns {MemoryTracker}
     */
    getMemoryTracker() {
        return this._diagnostics.memory;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    getPacketTracker() {
        return this._diagnostics.packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    getPerformanceTracker() {
        return this._diagnostics.performance;
    }

    /**
     * @public
     * @returns {StringTableHandler}
     */
    getStringTableHandler() {
        return this._handlers.stringTable;
    }

    /**
     * Extracts raw packets from a demo stream without parsing them.
     * This is a lightweight first pass that only extracts {@link DemoPacketRaw} instances.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} source
     * @returns {Promise<Array<DemoPacketRaw>>}
     */
    async extract(reader, source) {
        await this._prepareRun();

        /** @type {Array<*>} */
        const packets = [];

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
        ];

        this._state.started = true;

        try {
            this._diagnostics.logger.info('Extract started');

            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            const collector = new WritableSink((packet) => packets.push(packet));

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain, collector);

            await this._pipeline.ready();

            this._diagnostics.logger.info(`Extracted [ ${packets.length} ] packets`);

            return packets;
        } catch (error) {
            if (this._getIsAbortError(error)) {
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
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @param {boolean} [objectMode=false]
     * @returns {Promise<void>}
     */
    async parse(reader, source = DemoSource.REPLAY, objectMode = false) {
        await this._prepareRun();

        const chain = [ ];

        if (!objectMode) {
            chain.push(
                new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
                new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
            );
        }

        chain.push(
            new DemoStreamEventLoopBreaker(this._configuration),
            new DemoStreamPacketProcessor(this._configuration, this._processor, this._state.pause)
        );

        this._state.started = true;

        try {
            this._diagnostics.logger.info('Parse started');

            this._diagnostics.memory.on();
            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain);

            await this._pipeline.ready();
        } catch (error) {
            if (this._getIsAbortError(error)) {
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
     * Pauses the pipeline after the current packet finishes processing.
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
     * Resumes a paused pipeline.
     *
     * @public
     */
    resume() {
        this._validateAvailability();

        this._state.pause.resume();
    }

    /**
     * @protected
     */
    async _prepareRun() {
        this._validateAvailability();

        if (this._state.started && !this._state.finished) {
            throw new Error('Unable to run parser: engine is already running');
        }

        this._state.pause.release();

        this._demo.reset();
        this._processor.reset();

        this._state.started = false;
        this._state.finished = false;
    }

    /**
     * Throws if the engine has been disposed.
     *
     * @protected
     */
    _validateAvailability() {
        if (this._state.disposed) {
            throw new Error('Parser is not available: engine has been disposed');
        }
    }

    /**
     * @private
     * @param {*} error
     * @returns {boolean}
     */
    _getIsAbortError(error) {
        return error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.name === 'AbortError';
    }
}

export default ParserEngine;
