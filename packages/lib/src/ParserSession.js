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
        this._started = false;

        this._reader = null;
        this._parsePromise = null;
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

        const interceptor = (demoPacket) => {
            if (demoPacket.sequence === bootstrap[bootstrap.length - 1].sequence) {
                stringTableSnapshots.forEach((snapshot) => {
                    this._engine.demo.stringTableContainer.handleSnapshot(snapshot);
                });

                this._engine.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);
            }
        };

        this._engine.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);

        this._reader = new ReadableArray([ ...bootstrap, ...packets, ...remaining ], true);
        this._started = true;
        this._parsePromise = this._engine.parse(this._reader, this._source, true);

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
            if (error?.code !== 'ERR_STREAM_PREMATURE_CLOSE' && error?.name !== 'AbortError') {
                throw error;
            }
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

        const deferred = new DeferredPromise();

        let processed = 0;
        let tick = -1;

        const interceptor = (demoPacket) => {
            processed++;

            tick = demoPacket.tick;

            if (processed === count) {
                this._engine.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);

                deferred.resolve(tick);
            }
        };

        this._engine.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptor);

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

        for (let i = 0; i < count; i++) {
            this._reader.release();
        }
    }

}

export default ParserSession;
