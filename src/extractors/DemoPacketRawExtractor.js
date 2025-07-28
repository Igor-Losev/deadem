import Assert from '#core/Assert.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';
import VarInt32 from '#data/VarInt32.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';

class DemoPacketRawExtractor {
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
     * @param {number} partitionStart
     * @returns {Generator<DemoPacketRaw|null, void, *>}
     */
    *retrieve(sequenceStart, partitionStart) {
        Assert.isTrue(Number.isInteger(sequenceStart));
        Assert.isTrue(Number.isInteger(partitionStart));

        this._tail = this._buffer;

        for (let sequence = sequenceStart, partition = partitionStart; true; sequence++) {
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
                if (DemoPacketRaw.getTypeId(type.value) === DemoPacketType.DEM_FULL_PACKET.id) {
                    partition += 1;
                }

                const demoPacketRaw = new DemoPacketRaw(sequence, partition, type, tick, frame, new Uint8Array(this._tail.subarray(offset, offset + frame.value)));

                yield demoPacketRaw;

                offset += frame.value;

                this._tail = this._tail.subarray(offset);
            } else {
                yield null;

                break;
            }
        }
    }
}

export default DemoPacketRawExtractor;
