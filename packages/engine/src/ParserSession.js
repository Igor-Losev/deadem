import ReadableArray from '#core/stream/ReadableArray.js';

import DeferredPromise from '#data/DeferredPromise.js';

import InterceptorStage from '#data/enums/InterceptorStage.js';

class ParserSession {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {PlayerPacketIndex} index
     * @param {DemoSource} source
     */
    constructor(engine, index, source) {
        this._engine = engine;
        this._index = index;
        this._source = source;

        this._closed = false;
        this._error = null;
        this._started = false;

        this._reader = null;
        this._parsePromise = null;

        this._pending = new Set();
    }

    /**
     * @public
     * @returns {boolean}
     */
    get closed() {
        return this._closed;
    }

    /**
     * @public
     * @returns {Error|null}
     */
    get error() {
        return this._error;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get started() {
        return this._started;
    }

    /**
     * Prepares packets for the given tick, starts the parsing pipeline,
     * and processes bootstrap + tick packets.
     *
     * @public
     * @param {number} tick
     * @returns {Promise<number>} The tick value after processing.
     */
    async seekToTick(tick) {
        if (this._started) {
            throw new Error('Session has already been started');
        }

        if (this._closed) {
            throw new Error('Session has been closed');
        }

        const { bootstrap, stringTableSnapshots, packets, remaining } = this._index.getPacketsForTick(tick);

        const bootstrapInterceptor = (demoPacket) => {
            if (demoPacket.sequence === bootstrap[bootstrap.length - 1].sequence) {
                stringTableSnapshots.forEach((snapshot) => {
                    this._engine.getStringTableHandler().handleSnapshot(snapshot);
                });

                bootstrapTeardown();
            }
        };

        const bootstrapTeardown = () => {
            this._engine.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, bootstrapInterceptor);
            this._pending.delete(bootstrapTeardown);
        };

        this._engine.registerPostInterceptor(InterceptorStage.DEMO_PACKET, bootstrapInterceptor);
        this._pending.add(bootstrapTeardown);

        this._reader = new ReadableArray([ ...bootstrap, ...packets, ...remaining ], true);
        this._started = true;

        this._parsePromise = this._engine.parse(this._reader, this._source, true);
        this._parsePromise.catch((error) => this._onParseError(error));

        return this.process(bootstrap.length + packets.length);
    }

    /**
     * Aborts the pipeline and waits for the parse promise to settle.
     *
     * @public
     * @returns {Promise<void>}
     */
    async close() {
        if (this._closed) {
            return;
        }

        this._closed = true;

        if (!this._started) {
            return;
        }

        this._engine.abort();

        try {
            await this._parsePromise;
        } catch (error) {
            if (ParserSession._getIsAbortError(error)) {
                return;
            }

            if (this._error !== null) {
                return;
            }

            throw error;
        }
    }

    /**
     * Releases the specified number of packets through the gate
     * and waits for them to be fully processed by the pipeline.
     *
     * @public
     * @param {number} count
     * @returns {Promise<number>} The tick value of the last processed packet.
     */
    process(count) {
        if (!this._started) {
            throw new Error('Session has not been started');
        }

        if (this._closed) {
            throw new Error('Session has been closed');
        }

        if (this._error !== null) {
            return Promise.reject(this._error);
        }

        const deferred = new DeferredPromise();

        let processed = 0;
        let tick = -1;

        const interceptor = (demoPacket) => {
            processed++;

            tick = demoPacket.tick;

            if (processed === count) {
                teardown();

                deferred.resolve(tick);
            }
        };

        const teardown = (error) => {
            this._engine.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);
            this._pending.delete(teardown);

            if (error !== undefined) {
                deferred.reject(error);
            }
        };

        this._engine.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);
        this._pending.add(teardown);

        for (let i = 0; i < count; i++) {
            this._reader.release();
        }

        return deferred.promise;
    }

    /**
     * Releases packets through the gate without waiting for processing.
     *
     * @public
     * @param {number} [count=1]
     */
    release(count = 1) {
        if (!this._started) {
            throw new Error('Session has not been started');
        }

        if (this._closed) {
            throw new Error('Session has been closed');
        }

        if (this._error !== null) {
            throw this._error;
        }

        for (let i = 0; i < count; i++) {
            this._reader.release();
        }
    }

    /**
     * Handles a failure in the parse pipeline. Latches the error,
     * tears down every pending operation, and rejects associated deferreds.
     * Abort-related errors and post-close errors are ignored, since those
     * indicate a clean shutdown rather than a pipeline failure.
     *
     * @protected
     * @param {Error} error
     */
    _onParseError(error) {
        if (this._closed) {
            return;
        }

        if (ParserSession._getIsAbortError(error)) {
            return;
        }

        if (this._error !== null) {
            return;
        }

        this._error = error;

        const pending = [ ...this._pending ];

        this._pending.clear();

        for (const teardown of pending) {
            teardown(error);
        }
    }

    /**
     * @private
     * @static
     * @param {Error} error
     * @returns {boolean}
     */
    static _getIsAbortError(error) {
        return error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.name === 'AbortError';
    }
}

export default ParserSession;
