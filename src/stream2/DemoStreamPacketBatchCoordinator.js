import BinaryHeap from '#core/BinaryHeap.js';
import TransformStream from '#core/stream/TransformStream.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';

class DemoStreamPacketBatchCoordinator extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;

        this._heap = new BinaryHeap(([ batch ]) => batch.sequence);
        this._sequence = 0;
    }

    /**
     * @protected
     */
    async _finalize() {
        if (this._heap.length > 0) {
            this._engine.logger.warn(`DemoStreamPacketBatchCoordinator._flush() is called. However, heap has [ ${this._heap.length} ] packets. This should never happen`);
        }
    }

    /**
     * @protected
     * @param {Array<DemoPacketRawBatch, Array<EntityMutationEventPacked>>} data
     */
     _handle(data) {
        const sequence = data[0].sequence;

        if (this._sequence !== sequence) {
            this._heap.insert(data);

            return;
        }

        this._push(data);

        this._sequence += 1;

        while (this._heap.length > 0 && this._heap.root[0].sequence === this._sequence) {
            this._push(this._heap.extract());

            this._sequence += 1;
        }
    }
}

export default DemoStreamPacketBatchCoordinator;
