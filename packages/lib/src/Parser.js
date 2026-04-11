import Logger from '#core/Logger.js';

import DemoSource from '#data/enums/DemoSource.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';

import ParserConfiguration from './ParserConfiguration.js';
import ParserEngine from './ParserEngine.js';

class Parser {
    /**
     * @constructor
     * @param {ParserConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration = ParserConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        this._engine = new ParserEngine(configuration, logger);
    }

    /**
     * Aborts the currently running pipeline, if any.
     *
     * @public
     * @returns {void}
     */
    abort() {
        return this._engine.abort();
    }

    /**
     * Disposes the parser, terminating workers and clearing all state.
     * After disposal, the parser cannot be used.
     *
     * @public
     * @returns {Promise<void>}
     */
    dispose() {
        return this._engine.dispose();
    }

    /**
     * Extracts raw packets from a demo stream without parsing them.
     * This is a lightweight pass that only extracts {@link DemoPacketRaw} objects.
     *
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @returns {Promise<Array<DemoPacketRaw>>}
     */
    extract(reader, source = DemoSource.REPLAY) {
        return this._engine.extract(reader, source);
    }

    /**
     * @public
     * @returns {Demo}
     */
    getDemo() {
        return this._engine.demo;
    }

    /**
     * @public
     * @returns {boolean} 
     */
    getIsDisposed() {
        return this._engine.disposed;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsFinished() {
        return this._engine.finished;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsStarted() {
        return this._engine.started;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsPaused() {
        return this._engine.paused;
    }

    /**
     * @public
     * @returns {{memory: MemoryTrackerStats, performance: PerformanceTrackerStats, packet: PacketTrackerStats}}
     */
    getStats() {
        return {
            memory: this._engine.getMemoryTracker().getStats(),
            packet: this._engine.getPacketTracker().getStats(),
            performance: this._engine.getPerformanceTracker().getStats()
        };
    }

    /**
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @param {boolean} [objectMode=false]
     * @returns {Promise<void>}
     */
    parse(reader, source = DemoSource.REPLAY, objectMode = false) {
        return this._engine.parse(reader, source, objectMode);
    }

    /**
     *
     * Pauses the engine after the current packet finishes processing.
     *
     * @public
     */
    pause() {
        return this._engine.pause();
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPostInterceptor(stage, interceptor) {
        return this._engine.registerPostInterceptor(stage, interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPreInterceptor(stage, interceptor) {
        return this._engine.registerPreInterceptor(stage, interceptor);
    }

    /**
     * Resumes a paused engine.
     *
     * @public
     */
    resume() {
        return this._engine.resume();
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPostInterceptor(stage, interceptor) {
        return this._engine.unregisterPostInterceptor(stage, interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPreInterceptor(stage, interceptor) {
        return this._engine.unregisterPreInterceptor(stage, interceptor);
    }
}

export default Parser;
