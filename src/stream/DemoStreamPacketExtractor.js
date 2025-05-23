'use strict';

const Stream = require('stream');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const DemoPacketRawExtractor = require('./../extractors/DemoPacketRawExtractor');

const DEMO_HEADER_SIZE_BYTES = 16;

/**
 * Extracts one or more {@link DemoPacketRaw} from a given buffer.
 * Packets may vary in size, so if a chunk doesn't contain the complete data,
 * the {@link DemoStreamPacketExtractor} will wait for subsequent chunks to complete
 * the extraction of the {@link DemoPacketRaw}.
 */
class DemoStreamPacketExtractor extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._counts = {
            bytes: 0,
            chunks: 0,
            packets: 0
        };

        this._tail = Buffer.alloc(0);
    }

    get counts() {
        return this._counts;
    }

    /**
     * @protected
     * @param {TransformCallback} callback
     */
    _flush(callback) {
        if (this._tail.length !== 0) {
            this._engine.logger.warn(`DemoStreamPacketExtractor._flush() is called. However, there are [ ${this._tail.length} ] unhandled bytes. This should never happen`);
        }

        callback();
    }

    /**
     * @protected
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(chunk, encoding, callback) {
        let buffer = chunk;

        if (this._counts.chunks === 0) {
            buffer = chunk.subarray(DEMO_HEADER_SIZE_BYTES);
        }

        if (this._tail.length !== 0) {
            buffer = Buffer.concat([ this._tail, buffer ]);

            this._tail = Buffer.alloc(0);
        }

        const extractor = new DemoPacketRawExtractor(buffer);
        const generator = extractor.retrieve(this._counts.packets);

        while (true) {
            this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_EXTRACTOR);

            const next = generator.next();

            this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_EXTRACTOR);

            if (next.done) {
                break;
            }

            const packet = next.value;

            if (packet !== null) {
                this._counts.packets += 1;

                this.push(packet);
            } else if (extractor.tail.length > 0) {
                this._tail = extractor.tail;
            }
        }

        this._counts.chunks += 1;

        callback();
    }
}

module.exports = DemoStreamPacketExtractor;
