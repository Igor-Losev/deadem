const Stream = require('stream');

const DemoPacketRaw = require('./../data/DemoPacketRaw'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const DEMO_CHUNK_PARSE_RETRIES = 3;
const DEMO_IGNORED_HEADER_LENGTH = 16;

class DemoStreamPacketExtractor extends Stream.Transform {
    constructor() {
        super({ objectMode: true });

        this._chunk = {
            buffer: new Buffer.alloc(0),
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
        PerformanceTracker.start(PerformanceTrackerCategory.DEMO_PACKETS_EXTRACT);

        this._chunk.buffer = Buffer.concat([ this._chunk.buffer, chunk ]);
        this._chunk.pointer = 0;

        if (this._counts.chunks === 0) {
            this._chunk.pointer += DEMO_IGNORED_HEADER_LENGTH;
        }

        const parseChunkRecursively = () => {
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

            if (packet === null || this._retries > 0) {
                this._chunk.buffer = this._chunk.buffer.subarray(this._chunk.pointer);
            } else {
                this._counts.packets += 1;

                this._chunk.pointer += packet.getOriginalSize();

                process.nextTick(() => {
                    this.push(packet);
                });

                parseChunkRecursively();
            }
        };

        parseChunkRecursively();

        this._counts.chunks += 1;

        PerformanceTracker.end(PerformanceTrackerCategory.DEMO_PACKETS_EXTRACT);

        callback();
    }
}

module.exports = DemoStreamPacketExtractor;
