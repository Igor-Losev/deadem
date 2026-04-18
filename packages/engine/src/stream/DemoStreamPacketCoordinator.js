import BinaryHeap from '#core/BinaryHeap.js';
import Transform from '#core/stream/Transform.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';

/**
 * Given a stream of {@link DemoPacket} or {@link DemoPacketRaw}:
 *  - Filters out unparsed {@link DemoPacketRaw} packets.
 *  - Ensures that {@link DemoPacket} packets are passed through in the correct sequence order.
 */
class DemoStreamPacketCoordinator extends Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;

        this._heap = new BinaryHeap(demoPacket => demoPacket.ordinal);
        this._sequence = 0;
    }

    /**
     * @protected
     */
    async _finalize() {
        if (this._heap.length > 0) {
            this._engine.logger.warn(`DemoStreamPacketCoordinator._flush() is called. However, heap has [ ${this._heap.length} ] packets. This should never happen`);
        }
    }

    /**
     * @protected
     * @param {DemoPacket|DemoPacketRaw} packet
     */
    async _handle(packet) {
        if (packet instanceof DemoPacketRaw) {
            this._sequence += 1;

            return;
        }

        if (packet.ordinal !== this._sequence) {
            this._heap.insert(packet);

            return;
        }

        this._push(packet);

        this._sequence += 1;

        while (this._heap.length > 0 && this._heap.root.ordinal === this._sequence) {
            this._push(this._heap.extract());

            this._sequence += 1;
        }
    }
}

export default DemoStreamPacketCoordinator;
