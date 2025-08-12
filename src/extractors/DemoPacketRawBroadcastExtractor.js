import Assert from '#core/Assert.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';
import VarInt32 from '#data/VarInt32.js';

import DemoSource from '#data/enums/DemoSource.js';

class DemoPacketRawBroadcastExtractor {
    /**
     * @public
     * @constructor
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this._buffer = buffer;

        this._tail = buffer;
    }

    /**
     * @public
     * @returns {Buffer}
     */
    get tail() {
        return this._tail;
    }

    /**
     * @public
     * @param {number} sequenceStart
     * @returns {Generator<DemoPacketRaw|null, void, *>}
     */
    *retrieve(sequenceStart) {
        Assert.isTrue(Number.isInteger(sequenceStart));

        this._tail = this._buffer;

        for (let sequence = sequenceStart; true; sequence++) {
            let offset = 0;

            const type = VarInt32.parse(this._tail.subarray(offset));

            if (type === null) {
                yield null;

                break;
            }

            offset += type.size;

            let tick;

            try {
                tick = new VarInt32(this._tail.readUInt32LE(offset), 4);
            } catch {
                yield null;

                break;
            }

            offset += tick.size;
            
            // 1 byte ignored
            offset += 1;

            let frame;

            try {
                frame = new VarInt32(this._tail.readUInt32LE(offset), 4);
            } catch {
                yield null;

                break;
            }

            offset += frame.size;

            if (this._tail.byteLength - offset >= frame.value) {
                yield new DemoPacketRaw(sequence, type, DemoSource.HTTP_BROADCAST, tick, frame, new Uint8Array(this._tail.subarray(offset, offset + frame.value)));

                offset += frame.value;

                this._tail = this._tail.subarray(offset);
            } else {
                yield null;

                break;
            }
        }
    }
}

export default DemoPacketRawBroadcastExtractor;

