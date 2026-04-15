import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';

import DeferredPromise from '#data/DeferredPromise.js';
import DemoSource from '#data/enums/DemoSource.js';
import PlaybackInterruptedError from '#errors/PlaybackInterruptedError.js';
import PlayerState from '#data/enums/PlayerState.js';

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

        if (configuration.parserThreads > 0) {
            throw new Error('Player: parallel parsing is not supported yet');
        }

        this._engine = new ParserEngine(configuration, logger);
        this._state = PlayerState.IDLE;

        this._playback = {
            deferred: null
        };

        this._ticks = {
            current: -1,
            first: -1,
            last: -1,
            position: -1
        };

        this._index = null;
        this._session = null;
        this._source = null;
    }

    /**
     * @public
     * @returns {PlayerState} 
     */
    get state() {
        return this._state;
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
        if (this._state === PlayerState.PLAYING) {
            this._stopPlayback(PlaybackInterruptedError.DISPOSED);
        }

        this._transition(PlayerState.DISPOSED);

        if (this._session !== null) {
            await this._session.close();

            this._session = null;
        }

        await this._engine.dispose();

        this._index = null;
        this._source = null;

        if (this._playback.deferred !== null) {
            this._playback.deferred.reject(new PlaybackInterruptedError(PlaybackInterruptedError.DISPOSED));

            this._playback.deferred = null;
        }

        this._ticks.current = -1;
        this._ticks.first = -1;
        this._ticks.last = -1;
        this._ticks.position = -1;
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
        this._requireState(PlayerState.IDLE, 'Unable to load');

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error('Unable to load: unsupported demo source, only REPLAY is supported');
        }

        const packets = await this._engine.extract(reader, demoSource);

        this._index = new PlayerPacketIndex(packets);
        this._source = demoSource;

        const first = this._index.getOrFail(0);
        const last = this._index.getOrFail(this._index.length - 1);

        this._ticks.first = first.tick.value;
        this._ticks.last = last.tick.value;

        this._transition(PlayerState.LOADED);

        await this.seekToTick(first.tick.value);
    }

    /**
     * Advances the demo state by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if there are no more ticks.
     */
    async nextTick() {
        this._requireState(PlayerState.LOADED, 'Unable to advance tick');

        return this._advanceTick();
    }

    /**
     * Pauses playback. The {@link Player#play} promise will be rejected.
     * Can be resumed with {@link Player#play}.
     *
     * @public
     */
    pause() {
        if (this._state !== PlayerState.PLAYING) {
            return;
        }

        this._stopPlayback(PlaybackInterruptedError.PAUSED);
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
        this._transition(PlayerState.PLAYING);

        this._playback.deferred = new DeferredPromise();

        this._runPlayback(rate);

        return this._playback.deferred.promise;
    }

    /**
     * Moves the demo state back by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if already at the first tick.
     */
    async prevTick() {
        this._requireState(PlayerState.LOADED, 'Unable to go to previous tick');

        const prev = this._index.retreat(this._ticks.position);

        if (prev === null) {
            return false;
        }

        await this.seekToTick(prev.tick);

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
        if (this._state === PlayerState.PLAYING) {
            this._stopPlayback(PlaybackInterruptedError.PAUSED);
        }

        this._transition(PlayerState.SEEKING);

        try {
            if (this._session !== null) {
                await this._session.close();
            }

            this._session = new ParserSession(this._engine, this._index, this._source);

            this._ticks.current = await this._session.seekToTick(tick);
            this._ticks.position = this._index.getTickPosition(this._ticks.current);
        } finally {
            this._state = PlayerState.LOADED;
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
        if (this._state !== PlayerState.PLAYING) {
            return;
        }

        this._stopPlayback(PlaybackInterruptedError.STOPPED);

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
        const next = this._index.advance(this._ticks.position);

        if (next === null) {
            return false;
        }

        this._ticks.position = next.position;
        this._ticks.current = await this._session.process(next.count);

        return true;
    }

    /**
     * @protected
     * @param {PlayerState} state
     * @param {string} action
     */
    _requireState(state, action) {
        if (this._state !== state) {
            throw new Error(`${action}: player is ${this._state.code}`);
        }
    }

    /**
     * Runs the playback loop. Processes one tick at a time, paced by
     * the demo's tick interval and the playback rate.
     *
     * @protected
     * @param {number} rate
     */
    async _runPlayback(rate) {
        const msPerTick = (this._engine.demo.server.tickInterval / rate) * 1000;

        const anchor = performance.now();
        let ticksProcessed = 0;

        const deferred = this._playback.deferred;

        while (!deferred.settled) {
            const hasMore = await this._advanceTick();

            if (!hasMore) {
                if (!deferred.settled) {
                    this._transition(PlayerState.LOADED);

                    deferred.resolve();
                }

                return;
            }

            ticksProcessed++;

            const expectedTime = anchor + ticksProcessed * msPerTick;
            const delay = expectedTime - performance.now();

            if (delay > 1) {
                await this._sleep(delay);
            }
        }
    }

    /**
     * @protected
     * @param {number} ms
     * @returns {Promise<void>}
     */
    _sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    /**
     * Stops the current playback, cancels any pending sleep,
     * and rejects the play() promise.
     *
     * @protected
     */
    /**
     * @protected
     * @param {'paused'|'stopped'|'disposed'} reason
     */
    _stopPlayback(reason) {
        this._transition(PlayerState.LOADED);

        this._playback.deferred.reject(new PlaybackInterruptedError(reason));
        this._playback.deferred = null;
    }

    /**
     * @protected
     * @param {PlayerState} next
     */
    _transition(next) {
        if (!this._state.canTransitionTo(next)) {
            throw new Error(`Invalid state transition: ${this._state.code} -> ${next.code}`);
        }

        this._state = next;
    }
}

export default Player;
