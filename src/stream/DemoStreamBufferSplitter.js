'use strict';

const assert = require('assert/strict'),
    Stream = require('stream');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const MEGABYTE = 1024 * 1024;

/**
 * Splits buffer into chunks with a maximum size of maxChunkSize (in bytes).
 */
class DemoStreamBufferSplitter extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     * @param {Number} maxChunkSize - The maximum size of each chunk in bytes.
     */
    constructor(parser, maxChunkSize = MEGABYTE) {
        super();

        assert(Number.isInteger(maxChunkSize));

        this._parser = parser;
        this._maxChunkSize = maxChunkSize;
    }

    /**
     * @protected
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(chunk, encoding, callback) {
        if (chunk.length <= this._maxChunkSize) {
            this.push(chunk);
        } else {
            for (let i = 0; i < Math.ceil(chunk.length / this._maxChunkSize); i++) {
                this._parser.performanceTracker.start(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                const slice = chunk.subarray(i * this._maxChunkSize, (i + 1) * this._maxChunkSize);

                this._parser.performanceTracker.end(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                this.push(slice);
            }
        }

        callback();
    }
}

module.exports = DemoStreamBufferSplitter;
