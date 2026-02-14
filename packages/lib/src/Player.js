import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';
import ReadableArray from '#core/stream/ReadableArray.js';

import DemoSource from '#data/enums/DemoSource.js';

import InterceptorStage from './data/enums/InterceptorStage.js';

import Parser from './Parser.js';
import ParserConfiguration from './ParserConfiguration.js';
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

        this._parser = new Parser(configuration, logger);

        this._ticks = {
            current: -1,
            first: -1,
            last: -1
        };

        this._disposed = false;
        this._loaded = false;
        this._seeking = false;

        this._index = null;
        this._source = null;
    }

    /**
     * @public
     * @returns {Parser}
     */
    get parser() {
        return this._parser;
    }

    /**
     * @returns {{current: number, first: number, last: number}}
     */
    get ticks() {
        return this._ticks;
    }

    /**
     * Disposes the player, releasing the parser and clearing all state.
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

        await this._parser.dispose();

        this._index = null;
        this._source = null;
        this._loaded = false;
        this._seeking = false;

        this._ticks.current = -1;
        this._ticks.first = -1;
        this._ticks.last = -1;
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
        if (this._disposed) {
            throw new Error('Unable to load: player has been disposed');
        }

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error(`...`);
        }

        const packets = await this._parser.extract(reader, demoSource);

        this._index = new PlayerPacketIndex(packets);
        this._source = demoSource;

        this._ticks.current = this._index.getOrFail(0).tick.value;
        this._ticks.first = this._index.getOrFail(0).tick.value;
        this._ticks.last = this._index.getOrFail(this._index.length - 1).tick.value;

        this._loaded = true;
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
        this._validate();

        this._seeking = true;

        const { bootstrap, stringTableSnapshots, packets } = this._index.getPacketsForTick(tick);

        const interceptorForStringTables = (demoPacket) => {
            if (demoPacket.sequence === bootstrap[bootstrap.length - 1].sequence) {
                const demo = this._parser.getDemo();

                stringTableSnapshots.forEach((stringTableSnapshot) => {
                    demo.stringTableContainer.handleSnapshot(stringTableSnapshot);
                });

                this._parser.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForStringTables);
            }
        }

        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForStringTables);

        const reader = new ReadableArray([...bootstrap, ...packets]);

        const promise = this._parser.parse(reader, this._source, true);

        if (packets.length !== 0) {
            this._ticks.current = packets[packets.length - 1].tick.value;
        } else {
            this._ticks.current = bootstrap[bootstrap.length - 1].tick.value;
        }

        return promise.then(() => {
            this._seeking = false;
        });
    }

    /**
     * Advances the demo state by one tick.
     *
     * @public
     * @returns {Promise<boolean>} Returns false if there are no more ticks.
     */
    async nextTick() {
        this._validate();

        if (this._ticks.current >= this._ticks.last) {
            return false;
        }

        await this.seekToTick(this._ticks.current + 1);

        return true;
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

        await this.seekToTick(this._ticks.current - 1);

        return true;
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
    async play(rate = 1.0) {
        throw new Error('Not implemented');
    }

    /**
     * Pauses playback. The {@link Player#play} promise will be rejected.
     * Can be resumed with {@link Player#play}.
     *
     * @public
     */
    pause() {
        throw new Error('Not implemented');
    }

    /**
     * Stops playback and resets to the beginning.
     * The {@link Player#play} promise will be rejected.
     *
     * @public
     * @returns {Promise<void>}
     */
    async stop() {
        throw new Error('Not implemented');
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
    }
}

export default Player;
