import Assert from '#core/Assert.js';
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
     * @returns {Promise<void>}
     */
    parse(reader, source = DemoSource.REPLAY) {
        return this._engine.parse(reader, source);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPostInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        this._engine.interceptors.post[stage.id].push(interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPreInterceptor(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        this._engine.interceptors.pre[stage.id].push(interceptor);
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

        const index = this._engine.interceptors.post[stage.id].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._engine.interceptors.post[stage.id].splice(index, 1);

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

        const index = this._engine.interceptors.pre[stage.id].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._engine.interceptors.pre[stage.id].splice(index, 1);

        return true;
    }
}

export default Parser;
