import EntityMutationBatch from '#data/entity/EntityMutationBatch.js';

import FieldPathExtractor from './FieldPathExtractor.js';

class EntityMutationExtractor {
    /**
     * @public
     * @constructor
     * @param {BitBuffer} bitBuffer
     * @param {Serializer} serializer
     */
    constructor(bitBuffer, serializer) {
        this._bitBuffer = bitBuffer;
        this._serializer = serializer;
    }

    /**
     * Extracts all entity mutations from the buffer as a {@link EntityMutationBatch}.
     *
     * @public
     * @returns {EntityMutationBatch}
     */
    all() {
        const fieldPathExtractor = new FieldPathExtractor(this._bitBuffer);
        const fieldPathIds = fieldPathExtractor.allIds();

        const ids = new Uint32Array(fieldPathIds.length);
        const values = new Array(fieldPathIds.length);

        for (let i = 0; i < fieldPathIds.length; i++) {
            const id = fieldPathIds[i];

            ids[i] = id;
            values[i] = this._serializer.getDecoderForFieldPathId(id)(this._bitBuffer);
        }

        return new EntityMutationBatch(ids, values);
    }

    /**
     * Extracts mutations in a packed (transferable) format suitable for
     * transmission between threads.
     *
     * @public
     * @returns {Array<bigint|*>}
     */
    allPacked() {
        const fieldPathExtractor = new FieldPathExtractor(this._bitBuffer);
        const fieldPaths = fieldPathExtractor.all();

        const mutations = [ ];

        for (let i = 0; i < fieldPaths.length; i++) {
            const fieldPath = fieldPaths[i];

            const decoder = this._serializer.getDecoderForFieldPath(fieldPath);
            const value = decoder(this._bitBuffer);

            mutations.push(fieldPath.transferCode, value);
        }

        return mutations;
    }

    /**
     * Advances the buffer past one entity's worth of mutations without
     * producing any output. Decoders still run so the bit-stream stays
     * correctly aligned for subsequent entities.
     *
     * @public
     */
    skip() {
        const ids = new FieldPathExtractor(this._bitBuffer).allIds();

        for (let i = 0; i < ids.length; i++) {
            const decoder = this._serializer.getDecoderForFieldPathId(ids[i]);

            decoder(this._bitBuffer);
        }
    }
}

export default EntityMutationExtractor;
