const Stream = require('stream');

const DemoPacketRaw = require('./../data/DemoPacketRaw'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const DEMO_CHUNK_PARSE_RETRIES = 3;
const DEMO_IGNORED_HEADER_LENGTH = 16;

class DemoStreamPacketExtractor extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;

        this._chunk = {
            buffer: Buffer.alloc(0),
            pointer: 0
        };

        this._counts = {
            bytes: 0,
            chunks: 0,
            packets: 0
        };

        this._retries = 0;
    }

    get counts() {
        return this._counts;
    }

    _transform(chunk, encoding, callback) {
        this._chunk.buffer = Buffer.concat([ this._chunk.buffer, chunk ]);
        this._chunk.pointer = 0;

        if (this._counts.chunks === 0) {
            this._chunk.pointer += DEMO_IGNORED_HEADER_LENGTH;
        }

        const parseChunkRecursively = () => {
            this._parser.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_EXTRACTOR);

            const tail = this._chunk.buffer.subarray(this._chunk.pointer);

            let packet;

            try {
                packet = DemoPacketRaw.parse(tail);

                this._retries = 0;
            } catch (error) {
                if (this._retries >= DEMO_CHUNK_PARSE_RETRIES) {
                    throw error;
                } else {
                    this._retries += 1;
                }
            }

            this._parser.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_EXTRACTOR);

            if (packet === null || this._retries > 0) {
                this._chunk.buffer = this._chunk.buffer.subarray(this._chunk.pointer);
            } else {
                this._counts.packets += 1;

                this._chunk.pointer += packet.getOriginalSize();

                this.push(packet);

                parseChunkRecursively();
            }
        };

        parseChunkRecursively();

        this._counts.chunks += 1;

        callback();
    }
}

module.exports = DemoStreamPacketExtractor;
