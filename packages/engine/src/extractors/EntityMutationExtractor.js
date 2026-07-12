/** @import BitBuffer from '#core/BitBuffer.js' */

/** @import Serializer from '#data/fields/Serializer.js' */
/** @import { FieldDecoderFn } from '#data/fields/decoding/FieldDecoder.js' */

import EntityMutationBatch from '#data/entity/EntityMutationBatch.js';

import FieldPathExtractor from './FieldPathExtractor.js';

class EntityMutationExtractor {
    /**
     * @public
     * @constructor
     * @param {BitBuffer} bitBuffer
     * @param {Serializer|null} [serializer=null]
     */
    constructor(bitBuffer, serializer = null) {
        this._bitBuffer = bitBuffer;

        /** @type {Serializer|null} */
        this._serializer = serializer;

        this._fieldPathExtractor = new FieldPathExtractor(bitBuffer);
    }

    /**
     * @public
     * @param {Serializer} serializer
     */
    set serializer(serializer) {
        this._serializer = serializer;
    }

    /**
     * Extracts all entity mutations from the buffer as a {@link EntityMutationBatch}.
     *
     * @public
     * @returns {EntityMutationBatch}
     */
    all() {
        const serializer = /** @type {Serializer} */ (this._serializer);

        const fieldPathIds = this._fieldPathExtractor.allIds();

        const ids = new Uint32Array(fieldPathIds.length);
        const values = new Array(fieldPathIds.length);

        for (let i = 0; i < fieldPathIds.length; i++) {
            const id = fieldPathIds[i];

            ids[i] = id;
            values[i] = serializer.getDecoderForFieldPathId(id)(this._bitBuffer);
        }

        return new EntityMutationBatch(ids, values);
    }

    /**
     * Decodes all mutations in bit-stream order and invokes
     * `callback(id, value)` for each one.
     *
     * @public
     * @param {(id: number, value: *) => void} callback
     */
    forEach(callback) {
        const serializer = /** @type {Serializer} */ (this._serializer);

        const ids = this._fieldPathExtractor.allIds();

        for (let i = 0; i < ids.length; i++) {
            callback(ids[i], serializer.getDecoderForFieldPathId(ids[i])(this._bitBuffer));
        }
    }

    /**
     * Advances the buffer past one entity's worth of mutations without
     * producing any output. Decoders still run so the bit-stream stays
     * correctly aligned for subsequent entities.
     *
     * @public
     */
    skip() {
        const serializer = /** @type {Serializer} */ (this._serializer);

        const ids = this._fieldPathExtractor.allIds();

        for (let i = 0; i < ids.length; i++) {
            const decoder = serializer.getDecoderForFieldPathId(ids[i]);

            decoder(this._bitBuffer);
        }
    }
}

export default EntityMutationExtractor;
