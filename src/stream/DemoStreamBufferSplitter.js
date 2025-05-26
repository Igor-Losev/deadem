import Stream from 'node:stream';

import Assert from './../core/Assert.js';

import PerformanceTrackerCategory from './../data/enums/PerformanceTrackerCategory.js';

const MEGABYTE = 1024 * 1024;

/**
 * Splits buffer into chunks with a maximum size of maxChunkSize (in bytes).
 */
class DemoStreamBufferSplitter extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {number} maxChunkSize - The maximum size of each chunk in bytes.
     */
    constructor(engine, maxChunkSize = MEGABYTE) {
        super({ objectMode: true });

        Assert.isTrue(Number.isInteger(maxChunkSize))

        this._engine = engine;
        this._maxChunkSize = maxChunkSize;
    }

    /**
     * @protected
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(chunk, encoding, callback) {
        if (chunk.byteLength <= this._maxChunkSize) {
            this.push(chunk);
        } else {
            for (let i = 0; i < Math.ceil(chunk.byteLength / this._maxChunkSize); i++) {
                this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                const slice = chunk.subarray(i * this._maxChunkSize, (i + 1) * this._maxChunkSize);

                this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                this.push(slice);
            }
        }

        callback();
    }
}

export default DemoStreamBufferSplitter;
