import Stream from 'node:stream';

import BinaryHeap from './../data/structures/BinaryHeap.js';

/**
 * Given a stream of {@link DemoPacket}, ensures that they are passed
 * through in the correct sequence order.
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
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        if (demoPacket.sequence !== this._sequence) {
            this._heap.insert(demoPacket);

            callback();

            return;
        }

        this.push(demoPacket);

        this._sequence += 1;

        while (this._heap.length > 0 && this._heap.root.sequence === this._sequence) {
            this.push(this._heap.extract());

            this._sequence += 1;
        }

        callback();
    }
}

export default DemoStreamPacketCoordinator;
