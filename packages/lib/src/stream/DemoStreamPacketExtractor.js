import { Buffer } from 'node:buffer';

import Assert from '#core/Assert.js';

import TransformStream from '#core/stream/TransformStream.js';

import DemoSource from '#data/enums/DemoSource.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import DemoPacketRawBroadcastExtractor from '#extractors/DemoPacketRawBroadcastExtractor.js';
import DemoPacketRawReplayExtractor from '#extractors/DemoPacketRawReplayExtractor.js';

const DEMO_REPLAY_HEADER_SIZE_BYTES = 16;

/**
 * Extracts one or more {@link DemoPacketRaw} from a given buffer.
 * Packets may vary in size, so if a chunk doesn't contain the complete data,
 * the {@link DemoStreamPacketExtractor} will wait for subsequent chunks to complete
 * the extraction of the {@link DemoPacketRaw}.
 */
class DemoStreamPacketExtractor extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {DemoSource} source
     */
    constructor(engine, source) {
        super();

        Assert.isTrue(source instanceof DemoSource);

        this._engine = engine;
        this._source = source;

        this._counts = {
            bytes: 0,
            chunks: 0,
            packets: 0
        };

        this._tail = Buffer.alloc(0);
    }

    /**
     * @public
     * @returns {{bytes: number, chunks: number, packets: number}}
     */
    get counts() {
        return this._counts;
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        if (this._tail.length !== 0) {
            this._engine.logger.warn(`DemoStreamPacketExtractor._flush() is called. However, there are [ ${this._tail.length} ] unhandled bytes. This should never happen`);
        }
    }

    /**
     * @protected
     * @param {Buffer} chunk
     */
    async _handle(chunk) {
        let buffer = chunk;

        if (this._source === DemoSource.REPLAY && this._counts.chunks === 0) {
            buffer = chunk.subarray(DEMO_REPLAY_HEADER_SIZE_BYTES);
        }

        if (this._tail.length !== 0) {
            buffer = Buffer.concat([ this._tail, buffer ]);

            this._tail = Buffer.alloc(0);
        }

        let extractor;

        if (this._source === DemoSource.HTTP_BROADCAST) {
            extractor = new DemoPacketRawBroadcastExtractor(buffer);
        } else {
            extractor = new DemoPacketRawReplayExtractor(buffer);
        }

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

                this._push(packet);
            } else if (extractor.tail.length > 0) {
                this._tail = extractor.tail;
            }
        }

        this._counts.chunks += 1;
    }
}

export default DemoStreamPacketExtractor;
