/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import DemoPacketRawReplayExtractor from '../extractors/DemoPacketRawReplayExtractor.js' */

import Assert from '../core/Assert.js';
import BitWriter from '../core/BitWriter.js';

/**
 * Packs {@link DemoPacketRaw} into bytes.
 *
 * The counterpart of {@link DemoPacketRawReplayExtractor}.
 */
class DemoPacketRawReplayWriter {
    /** @private @type {Array<DemoPacketRaw>} */
    _demoPacketsRaw;

    /**
     * @public
     * @constructor
     * @param {Array<DemoPacketRaw>} demoPacketsRaw
     */
    constructor(demoPacketsRaw) {
        Assert.isTrue(Array.isArray(demoPacketsRaw), 'Invalid demoPacketsRaw: expected an array');

        this._demoPacketsRaw = demoPacketsRaw;
    }

    /**
     * @public
     * @static
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Uint8Array}
     */
    static write(demoPacketRaw) {
        const writer = new BitWriter(demoPacketRaw.getSize());

        DemoPacketRawReplayWriter._writeTo(writer, demoPacketRaw);

        return writer.getBuffer();
    }

    /**
     * @public
     * @returns {Uint8Array}
     */
    all() {
        const writer = new BitWriter(this._getCapacity());

        for (let i = 0; i < this._demoPacketsRaw.length; i++) {
            DemoPacketRawReplayWriter._writeTo(writer, this._demoPacketsRaw[i]);
        }

        return writer.getBuffer();
    }

    /**
     * @private
     * @returns {number}
     */
    _getCapacity() {
        let capacity = 0;

        for (let i = 0; i < this._demoPacketsRaw.length; i++) {
            capacity += this._demoPacketsRaw[i].getSize();
        }

        return capacity;
    }

    /**
     * @private
     * @static
     * @param {BitWriter} writer
     * @param {DemoPacketRaw} demoPacketRaw
     */
    static _writeTo(writer, demoPacketRaw) {
        writer.writeUVarInt32(demoPacketRaw.type.value);
        writer.writeUVarInt32(demoPacketRaw.tick.value >>> 0);
        writer.writeUVarInt32(demoPacketRaw.payload.length);

        writer.writeBytes(demoPacketRaw.payload);
    }
}

export default DemoPacketRawReplayWriter;
