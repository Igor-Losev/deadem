import Stream from 'node:stream';

import BinaryHeap from '#core/BinaryHeap.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';

/**
 * Given a stream of {@link DemoPacket} or {@link DemoPacketRaw}:
 *  - Filters out unparsed {@link DemoPacketRaw} packets.
 *  - Ensures that {@link DemoPacket} packets are passed through in the correct sequence order.
 */
class DemoStreamPacketCoordinator extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._heap = new BinaryHeap(demoPacket => demoPacket.sequence);
        this._sequence = 0;
    }

    /**
     * @protected
     * @param {TransformCallback} callback
     */
    _flush(callback) {
        if (this._heap.length > 0) {
            this._engine.logger.warn(`DemoStreamPacketCoordinator._flush() is called. However, heap has [ ${this._heap.length} ] packets. This should never happen`);
        }

        callback();
    }

    /**
     * @protected
     * @param {DemoPacket|DemoPacketRaw} packet
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(packet, encoding, callback) {
        if (packet instanceof DemoPacketRaw) {
            this._engine.getPacketTracker().handleDemoPacketRaw(packet);

            this._sequence += 1;

            callback();

            return;
        }

        if (packet.sequence !== this._sequence) {
            this._heap.insert(packet);

            callback();

            return;
        }

        this.push(packet);

        this._sequence += 1;

        while (this._heap.length > 0 && this._heap.root.sequence === this._sequence) {
            this.push(this._heap.extract());

            this._sequence += 1;
        }

        callback();
    }
}

export default DemoStreamPacketCoordinator;
