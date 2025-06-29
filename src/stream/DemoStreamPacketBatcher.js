import Assert from '#core/Assert.js';
import TransformStream from '#core/stream/TransformStream.js';

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

        this._batch.packets.push(demoPacketRaw);
        this._batch.size += demoPacketRaw.getSize();

        if (this._batch.size >= this._thresholdSizeBytes) {
            this._send();
        } else {
            this._timeoutId = setTimeout(() => {
                this._send();
            }, this._thresholdWaitMilliseconds);
        }
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

        const packets = this._batch.packets;

        this._batch.packets = [ ];
        this._batch.size = 0;

        this._push(packets);
    }
}

export default DemoStreamPacketBatcher;
