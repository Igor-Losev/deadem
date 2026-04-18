import Assert from '#core/Assert.js';

import DemoSource from '#data/enums/DemoSource.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';
import VarInt32 from '#data/VarInt32.js';

class DemoPacketRawReplayExtractor {
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

            const tick = VarInt32.parse(this._tail.subarray(offset));

            if (tick === null) {
                yield null;

                break;
            }

            offset += tick.size;

            const frame = VarInt32.parse(this._tail.subarray(offset));

            if (frame === null) {
                yield null;

                break;
            }

            offset += frame.size;

            if (this._tail.length - offset >= frame.value) {
                yield new DemoPacketRaw(sequence, type, DemoSource.REPLAY, tick, frame, new Uint8Array(this._tail.subarray(offset, offset + frame.value)));

                offset += frame.value;

                this._tail = this._tail.subarray(offset);
            } else {
                yield null;

                break;
            }
        }
    }
}

export default DemoPacketRawReplayExtractor;
