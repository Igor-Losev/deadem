import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';

import DeferredPromise from '#data/DeferredPromise.js';
import DemoSource from '#data/enums/DemoSource.js';

import ParserConfiguration from './ParserConfiguration.js';
import ParserEngine from './ParserEngine.js';
import ParserSession from './ParserSession.js';
import PlayerPacketIndex from './PlayerPacketIndex.js';

class Player {
    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} [configuration=ParserConfiguration.DEFAULT]
     * @param {Logger} [logger=Logger.CONSOLE_INFO]
     */
    constructor(configuration = ParserConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._engine = new ParserEngine(configuration, logger);

        this._ticks = {
            current: -1,
            first: -1,
            last: -1
        };

        this._disposed = false;
        this._loaded = false;
        this._seeking = false;

        this._index = null;
        this._playback = null;
        this._session = null;
        this._source = null;
    }

    /**
     * @public
     * @returns {number}
     */
    getCurrentTick() {
        return this._ticks.current;
    }

    /**
     * @public
     * @returns {number}
     */
    getFirstTick() {
        return this._ticks.first;
    }

    /**
     * @public
     * @returns {number}
     */
    getLastTick() {
        return this._ticks.last;
    }

    /**
     * Disposes the player, releasing the engine and clearing all state.
     * After disposal, the player cannot be used.
     *
     * @public
     * @returns {Promise<void>}
     */
    async dispose() {
        if (this._disposed) {
            return;
        }

        this._disposed = true;

        if (this._playback !== null) {
            this._stopPlayback();
        }

        if (this._session !== null) {
            await this._session.close();

            this._session = null;
        }

        await this._engine.dispose();

        this._index = null;
        this._source = null;
        this._loaded = false;
        this._seeking = false;

        this._ticks.current = -1;
        this._ticks.first = -1;
        this._ticks.last = -1;
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
     * Loads a demo from a stream. This will buffer the entire demo
     * and build an index for seeking. The player will be ready for playback
     * after this method completes.
     *
     * @public
     * @param {Stream.Readable|ReadableStream} reader
     * @param {DemoSource} [demoSource=DemoSource.REPLAY]
     * @returns {Promise<void>}
     */
    async load(reader, demoSource = DemoSource.REPLAY) {
        // TODO: handle calling load multiple times (interruption)

        if (this._disposed) {
            throw new Error('Unable to load: player has been disposed');
        }

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error(`Unable to load: unsupported demo source, only REPLAY is supported`);
        }

        const packets = await this._engine.extract(reader, demoSource);

        this._index = new PlayerPacketIndex(packets);
        this._source = demoSource;

        const first = this._index.getOrFail(0);
        const last = this._index.getOrFail(this._index.length - 1);

        this._ticks.first = first.tick.value;
        this._ticks.last = last.tick.value;

        this._loaded = true;

        await this.seekToTick(first.tick.value);
    }

    /**
     * Advances the demo state by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if there are no more ticks.
     */
    async nextTick() {
        this._validate();

        return this._advanceTick();
    }

    /**
     * Pauses playback. The {@link Player#play} promise will be rejected.
     * Can be resumed with {@link Player#play}.
     *
     * @public
     */
    pause() {
        if (this._playback === null) {
            return;
        }

        this._stopPlayback();
    }

    /**
     * Starts continuous playback at the specified rate.
     * Resolves when playback reaches the end of the demo.
     * Rejects if playback is interrupted by {@link Player#pause} or {@link Player#stop}.
     *
     * @public
     * @param {number} [rate=1.0] Playback rate multiplier (1.0 = normal speed).
     * @returns {Promise<void>}
     */
    play(rate = 1.0) {
        this._validate();

        if (this._playback !== null) {
            throw new Error('Unable to play: playback is already in progress');
        }

        const deferred = new DeferredPromise();

        this._playback = {
            cancelSleep: null,
            deferred,
            stopped: false
        };

        this._runPlayback(rate);

        return deferred.promise;
    }

    /**
     * Moves the demo state back by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if already at the first tick.
     */
    async prevTick() {
        this._validate();

        if (this._ticks.current <= this._ticks.first) {
            return false;
        }

        const prevTickValue = this._index.prevTick(this._ticks.current);

        if (prevTickValue === null) {
            return false;
        }

        await this.seekToTick(prevTickValue);

        return true;
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
     * Seeks to the specified tick. If the tick is before the current position,
     * the player will restore from the nearest keyframe and replay forward.
     *
     * @public
     * @param {number} tick
     * @returns {Promise<void>}
     */
    async seekToTick(tick) {
        if (this._playback !== null) {
            this._stopPlayback();
        }

        this._validate();

        this._seeking = true;

        try {
            if (this._session !== null) {
                await this._session.close();
            }

            this._session = new ParserSession(this._engine, this._index, this._source);
            this._ticks.current = await this._session.seekToTick(tick);
        } finally {
            this._seeking = false;
        }
    }

    /**
     * Stops playback and resets to the beginning.
     * The {@link Player#play} promise will be rejected.
     *
     * @public
     * @returns {Promise<void>}
     */
    async stop() {
        if (this._playback === null) {
            return;
        }

        this._stopPlayback();

        await this.seekToTick(this._ticks.first);
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

    /**
     * Advances the demo state by one tick without validation.
     *
     * @protected
     * @returns {Promise<boolean>} Returns false if there are no more ticks.
     */
    async _advanceTick() {
        if (this._ticks.current >= this._ticks.last) {
            return false;
        }

        const nextTickValue = this._index.nextTick(this._ticks.current);

        if (nextTickValue === null) {
            return false;
        }

        const count = this._index.getPacketCountForTick(nextTickValue);

        this._ticks.current = await this._session.process(count);

        return true;
    }

    /**
     * Runs the playback loop. Processes one tick at a time, paced by
     * the demo's tick interval and the playback rate.
     *
     * @protected
     * @param {number} rate
     */
    async _runPlayback(rate) {
        const playback = this._playback;
        const msPerTick = (this._engine.demo.server.tickInterval / rate) * 1000;

        let anchor = performance.now();
        let ticksProcessed = 0;

        while (!playback.stopped) {
            const hasMore = await this._advanceTick();

            if (!hasMore) {
                this._playback = null;

                playback.deferred.resolve();

                return;
            }

            ticksProcessed++;

            const expectedTime = anchor + ticksProcessed * msPerTick;
            const delay = expectedTime - performance.now();

            if (delay > 1) {
                await this._sleep(delay, playback);
            }
        }
    }

    /**
     * Returns a cancellable sleep promise. Stores cancel function
     * on the playback object so _stopPlayback() can wake it up.
     *
     * @protected
     * @param {number} ms
     * @param {Object} playback
     * @returns {Promise<void>}
     */
    _sleep(ms, playback) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                playback.cancelSleep = null;

                resolve();
            }, ms);

            playback.cancelSleep = () => {
                clearTimeout(timer);

                playback.cancelSleep = null;

                resolve();
            };
        });
    }

    /**
     * Stops the current playback, cancels any pending sleep,
     * and rejects the play() promise.
     *
     * @protected
     */
    _stopPlayback() {
        const playback = this._playback;

        this._playback = null;

        playback.stopped = true;

        if (playback.cancelSleep !== null) {
            playback.cancelSleep();
        }

        playback.deferred.reject(new Error('Playback interrupted'));
    }

    /**
     * @protected
     */
    _validate() {
        if (this._disposed) {
            throw new Error('Unable to use player: player has been disposed');
        }

        if (!this._loaded) {
            throw new Error('Unable to use player: no demo loaded');
        }

        if (this._seeking) {
            throw new Error('Unable to use player: seek is in progress');
        }

        if (this._playback !== null) {
            throw new Error('Unable to use player: playback is in progress');
        }
    }
}

export default Player;
