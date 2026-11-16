/** @import SchemaRegistry from '../schema/SchemaRegistry.js' */

/** @import Demo from '../data/Demo.js' */
/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import { PlaybackInterruptionReason } from '../errors/PlaybackInterruptedError.js' */
/** @import { NodeReadable } from '#core/stream/Pipeline.js' */
/** @import { InterceptorMap, InterceptorPreStage } from '../data/InterceptorRegistry.js' */
/** @import InterceptorStage from '../data/enums/InterceptorStage.js' */

/** @import { MemoryTrackerStats } from '../diagnostics/trackers/MemoryTracker.base.js' */
/** @import { PacketTrackerStats } from '../diagnostics/trackers/PacketTracker.js' */
/** @import { PerformanceTrackerStats } from '../diagnostics/trackers/PerformanceTracker.js' */

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import DemoSource from '../data/enums/DemoSource.js';
import InterceptorRegistry from '../data/InterceptorRegistry.js';
import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';
import PlaybackInterruptedError from '../errors/PlaybackInterruptedError.js';
import PlayerState from '../data/enums/PlayerState.js';

import ParserDiagnostics from '../diagnostics/ParserDiagnostics.js';

import PacketCodec from '../schema/PacketCodec.js';

import DemoStreamBufferSplitter from '../stream/DemoStreamBufferSplitter.js';
import DemoStreamPacketExtractor from '../stream/DemoStreamPacketExtractor.js';

import DemoSession from '../DemoSession.js';
import ParserConfiguration from '../ParserConfiguration.js';

import PlaybackLoop from './PlaybackLoop.js';
import PlayerPacketIndex from './PlayerPacketIndex.js';
import ReplaySession from './ReplaySession.js';

/**
 * @template [M=unknown]
 */
class Player {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {ParserConfiguration} */
    _configuration;

    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {PlayerPacketIndex|null} */
    _index = null;

    /** @private @type {InterceptorRegistry} */
    _interceptors;

    /** @private @type {Pipeline|null} */
    _pipeline = null;

    /** @private */
    _playback = {
        /** @type {PlaybackLoop|null} */
        loop: null
    };

    /** @private @type {ReplaySession|null} */
    _replay = null;

    /** @private @type {DemoSession} */
    _session;

    /** @private */
    _state = PlayerState.IDLE;

    /** @private */
    _ticks = {
        current: -1,
        first: -1,
        last: -1,
        position: -1
    };

    /**
     * @public
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {ParserConfiguration} [configuration=ParserConfiguration.DEFAULT]
     * @param {Logger} [logger=Logger.CONSOLE_INFO]
     */
    constructor(registry, configuration = ParserConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._configuration = configuration;
        this._codec = new PacketCodec(registry);

        const diagnostics = new ParserDiagnostics(registry, logger);
        const interceptors = new InterceptorRegistry(registry.getUserCommandDecoder() !== null);

        this._diagnostics = diagnostics;
        this._interceptors = interceptors;
        this._session = new DemoSession(registry, configuration, diagnostics, interceptors);
    }

    /**
     * @public
     * @returns {PlayerState}
     */
    get state() {
        return this._state;
    }

    /**
     * Disposes the player, clearing all state.
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

        if (this._replay !== null) {
            this._replay.abort();

            this._replay = null;
        }

        if (this._index !== null) {
            this._diagnostics.memory.off();

            this._index = null;
        }

        if (this._pipeline !== null) {
            this._pipeline.abort();

            this._pipeline = null;
        }

        this._session.reset();
        this._interceptors.reset();

        this._ticks.current = -1;
        this._ticks.first = -1;
        this._ticks.last = -1;
        this._ticks.position = -1;
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
     * @returns {Demo}
     */
    getDemo() {
        return this._session.demo;
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
     * @public
     * @returns {{memory: MemoryTrackerStats, performance: PerformanceTrackerStats, packet: PacketTrackerStats}}
     */
    getStats() {
        return this._diagnostics.getStats();
    }

    /**
     * Loads a demo from a stream. This will buffer the entire demo
     * and build an index for seeking. The player will be ready for playback
     * after this method completes.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [demoSource=DemoSource.REPLAY]
     * @returns {Promise<void>}
     */
    async load(reader, demoSource = DemoSource.REPLAY) {
        this._requireState(PlayerState.IDLE, 'Unable to load');

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error('Unable to load: unsupported demo source, only REPLAY is supported');
        }

        const packets = await this._extract(reader, demoSource);

        this._index = new PlayerPacketIndex(this._codec, packets);
        this._replay = new ReplaySession(this._session, this._index, this._configuration.breakInterval);

        const first = this._index.getOrFail(0);
        const last = this._index.getOrFail(this._index.length - 1);

        this._ticks.first = first.tick.value;
        this._ticks.last = last.tick.value;

        this._diagnostics.memory.on();

        this._transition(PlayerState.LOADED);

        await this.seekToTick(first.tick.value);
    }

    /**
     * Advances the demo state by one tick.
     *
     * @public
     * @returns {boolean} Returns false if there are no more ticks.
     */
    nextTick() {
        this._requireState(PlayerState.LOADED, 'Unable to advance tick');

        return this._advanceTick() !== null;
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
     * Rejects if playback is interrupted by {@link Player#pause} or {@link Player#stop},
     * or if packet processing fails.
     *
     * @public
     * @param {number} [rate=1.0] Playback rate multiplier (1.0 = normal speed).
     * @returns {Promise<void>}
     */
    play(rate = 1.0) {
        Assert.isTrue(Number.isFinite(rate) && rate > 0, 'Invalid rate: expected a positive number');

        this._transition(PlayerState.PLAYING);

        const server = this._session.demo.server;

        Assert.exists(server, 'Server info is not available');

        const loop = new PlaybackLoop(() => this._advanceTick(), this._ticks.current, (server.tickInterval / rate) * 1000);

        this._playback.loop = loop;

        return loop.run().then(
            () => {
                if (this._playback.loop === loop) {
                    this._playback.loop = null;

                    this._transition(PlayerState.LOADED);
                }
            },
            (error) => {
                if (this._playback.loop === loop) {
                    this._playback.loop = null;

                    if (this._state === PlayerState.PLAYING) {
                        this._transition(PlayerState.LOADED);
                    }
                }

                throw error;
            }
        );
    }

    /**
     * Moves the demo state back by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if already at the first tick.
     */
    async prevTick() {
        this._requireState(PlayerState.LOADED, 'Unable to go to previous tick');

        Assert.exists(this._index, 'Player index is not initialized');

        const prev = this._index.retreat(this._ticks.position);

        if (prev === null) {
            return false;
        }

        await this.seekToTick(prev.tick);

        return true;
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
            Assert.exists(this._index, 'Player index is not initialized');
            Assert.exists(this._replay, 'Player session is not initialized');

            this._ticks.current = await this._replay.seek(tick);
            this._ticks.position = this._index.getTickPosition(this._ticks.current);
        } finally {
            if (this._state === PlayerState.SEEKING) {
                this._transition(PlayerState.LOADED);
            }
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
     * Advances the demo state by one tick without validation.
     *
     * @protected
     * @returns {number|null} The new tick, or null if there are no more ticks.
     */
    _advanceTick() {
        Assert.exists(this._index, 'Player index is not initialized');
        Assert.exists(this._replay, 'Player session is not initialized');

        const next = this._index.advance(this._ticks.position);

        if (next === null) {
            return null;
        }

        this._ticks.position = next.position;
        this._ticks.current = this._replay.process(next.count);

        return this._ticks.current;
    }

    /**
     * Extracts raw packets.
     *
     * @protected
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} source
     * @returns {Promise<Array<DemoPacketRaw>>}
     */
    async _extract(reader, source) {
        /** @type {Array<DemoPacketRaw>} */
        const packets = [ ];

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
        ];

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

            this._pipeline = null;
        }
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
     * @protected
     * @param {PlaybackInterruptionReason} reason
     */
    _stopPlayback(reason) {
        this._transition(PlayerState.LOADED);

        Assert.exists(this._playback.loop, 'Playback loop is not initialized');

        this._playback.loop.interrupt(reason);
        this._playback.loop = null;
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
