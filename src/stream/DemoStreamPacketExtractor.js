const Stream = require('stream');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const DemoPacketRawExtractor = require('./../extractors/DemoPacketRawExtractor');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('DemoStreamPacketExtractor');

const DEMO_HEADER_SIZE_BYTES = 16;

class DemoStreamPacketExtractor extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;

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
            logger.warn(`DemoStreamPacketExtractor._flush() is called. However, the are [ ${this._tail.length} ] unhandled bytes. This should never happen`);
        }

        callback()
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
        const generator = extractor.retrieve();

        for (const packet of generator) {
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
