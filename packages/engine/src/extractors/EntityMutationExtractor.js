/** @import BitReader from '../core/BitReader.js' */

/** @import Entity from '../data/entity/Entity.js' */

/** @import Serializer from '../data/fields/Serializer.js' */
/** @import { FieldDecoderFn } from '../data/fields/decoding/FieldDecoder.js' */

import EntityMutationBatch from '../data/entity/EntityMutationBatch.js';

import FieldPathExtractor from './FieldPathExtractor.js';

class EntityMutationExtractor {
    /**
     * @public
     * @constructor
     * @param {BitReader} bitReader
     * @param {Serializer|null} [serializer=null]
     */
    constructor(bitReader, serializer = null) {
        /** @private */
        this._bitReader = bitReader;

        /** @private @type {Serializer|null} */
        this._serializer = serializer;

        /** @private */
        this._fieldPathExtractor = new FieldPathExtractor(bitReader);
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
            values[i] = serializer.getDecoderForFieldPathId(id)(this._bitReader);
        }

        return new EntityMutationBatch(ids, values);
    }

    /**
     * Decodes all mutations in bit-stream order and applies them to the entity.
     *
     * @public
     * @param {Entity} entity
     */
    applyTo(entity) {
        const serializer = /** @type {Serializer} */ (this._serializer);

        const ids = this._fieldPathExtractor.allIds();

        for (let i = 0; i < ids.length; i++) {
            entity.updateByFieldPathId(ids[i], serializer.getDecoderForFieldPathId(ids[i])(this._bitReader));
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

            decoder(this._bitReader);
        }
    }
}

export default EntityMutationExtractor;
