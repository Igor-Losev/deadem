'use strict';

const assert = require('node:assert/strict');

const DemoPacketRaw = require('./../data/DemoPacketRaw'),
    UVarInt32 = require('./../data/UVarInt32');

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

    get tail() {
        return this._tail;
    }

    *retrieve(sequenceStart) {
        assert(Number.isInteger(sequenceStart));

        this._tail = this._buffer;

        for (let sequence = sequenceStart; true; sequence++) {
            let offset = 0;

            const command = UVarInt32.parse(this._tail.subarray(offset));

            if (command === null) {
                yield null;

                break;
            }

            offset += command.size;

            const tick = UVarInt32.parse(this._tail.subarray(offset));

            if (tick === null) {
                yield null;

                break;
            }

            offset += tick.size;

            const frame = UVarInt32.parse(this._tail.subarray(offset));

            if (frame === null) {
                yield null;

                break;
            }

            offset += frame.size;

            if (this._tail.length - offset >= frame.value) {
                yield new DemoPacketRaw(sequence, command, tick, frame, this._tail.subarray(offset, offset + frame.value));

                offset += frame.value;

                this._tail = this._tail.subarray(offset);
            } else {
                yield null;

                break;
            }
        }
    }
}

module.exports = DemoPacketRawExtractor;
