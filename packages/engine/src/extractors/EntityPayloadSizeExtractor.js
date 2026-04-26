import Assert from '#core/Assert.js';

/**
 * Extracts per-entity payload sizes (in bits) from {@link CSVCMsg_PacketEntities.serializedEntities}.
 */
class EntityPayloadSizeExtractor {
    /**
     * @public
     * @constructor
     * @param {Uint8Array} buffer
     */
    constructor(buffer) {
        Assert.isTrue(buffer instanceof Uint8Array);

        this._buffer = buffer;
    }

    /**
     * @public
     * @returns {Generator<number, void, *>}
     */
    *retrieve() {
        for (let i = 0; i < this._buffer.length;) {
            let value = 0;
            let shift = 0;

            for (;;) {
                const byte = this._buffer[i++];

                value |= (byte & 0x7F) << shift;

                if ((byte & 0x80) === 0) {
                    break;
                }

                shift += 7;
            }

            yield value;
        }
    }
}

export default EntityPayloadSizeExtractor;
