import Assert from '#core/Assert.js';
import TransformStream from '#core/stream/TransformStream.js';

import DemoPacketRawBatch from '#data/DemoPacketRawBatch.js';

/**
 * Batches a stream of {@link DemoPacketRaw} into groups before passing them through.
 * The batching strategy is based on two factors:
 *  1. The total byte size of the included messages. If it exceeds a threshold, the batch is passed through.
 *  2. The amount of time (in milliseconds) pending. If it exceeds a threshold, the batch is passed through.
 */
class DemoStreamPacketBatcher extends TransformStream {
    /**
     * @public
     * @constructor
     *
     * @param {ParserEngine} engine
     * @param {number} thresholdSizeBytes - The threshold for the total byte size of the messages in the batch.
     * @param {number} thresholdWaitMilliseconds - The threshold for the amount of time (in milliseconds) that the batch has been pending.
     */
    constructor(engine, thresholdSizeBytes, thresholdWaitMilliseconds) {
        super();

        Assert.isTrue(Number.isInteger(thresholdSizeBytes));
        Assert.isTrue(Number.isInteger(thresholdWaitMilliseconds));

        this._engine = engine;

        this._thresholdSizeBytes = thresholdSizeBytes;
        this._thresholdWaitMilliseconds = thresholdWaitMilliseconds;

        this._timeoutId = null;

        this._batch = {
            packets: [ ],
            size: 0
        };

        this._batches = 0;
        this._partition = -1;
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        this._send();
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);

            this._timeoutId = null;
        }

        const sizeThresholdReached = this._batch.size >= this._thresholdSizeBytes;
        const partitionChanged = this._partition !== demoPacketRaw.partition;

        if (sizeThresholdReached || partitionChanged) {
            this._send();

            if (partitionChanged) {
                this._partition = demoPacketRaw.partition;
            }
        } else {
            this._timeoutId = setTimeout(() => {
                this._send();
            }, this._thresholdWaitMilliseconds);
        }

        this._batch.packets.push(demoPacketRaw);
        this._batch.size += demoPacketRaw.getSize();
    }

    /**
     * @protected
     */
    _send() {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);

            this._timeoutId = null;
        }

        if (this._batch.packets.length === 0) {
            return;
        }

        const batch = new DemoPacketRawBatch(this._batches, this._partition, this._batch.packets);

        this._batches++;

        this._batch.packets = [ ];
        this._batch.size = 0;

        this._push(batch);
    }
}

export default DemoStreamPacketBatcher;
