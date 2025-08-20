import Assert from '#core/Assert.js';
import TransformStream from '#core/stream/TransformStream.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

/**
 * Splits buffer into chunks with a maximum size of maxChunkSize (in bytes).
 */
class DemoStreamBufferSplitter extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {number} maxChunkSize - The maximum size of each chunk in bytes.
     */
    constructor(engine, maxChunkSize) {
        super();

        Assert.isTrue(Number.isInteger(maxChunkSize));

        this._engine = engine;
        this._maxChunkSize = maxChunkSize;
    }

    /**
     * @protected
     * @param {Buffer} chunk
     */
    async _handle(chunk) {
        if (chunk.byteLength <= this._maxChunkSize) {
            this._push(chunk);
        } else {
            for (let i = 0; i < Math.ceil(chunk.byteLength / this._maxChunkSize); i++) {
                this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                const slice = chunk.subarray(i * this._maxChunkSize, (i + 1) * this._maxChunkSize);

                this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                this._push(slice);
            }
        }
    }
}

export default DemoStreamBufferSplitter;
