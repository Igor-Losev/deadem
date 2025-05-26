import EntityMutation from '../data/entity/EntityMutation.js';

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
     * @public
     * @returns {Array<EntityMutation>}
     */
    all() {
        const fieldPathExtractor = new FieldPathExtractor(this._bitBuffer);
        const fieldPaths = fieldPathExtractor.all();

        const mutations = [ ];

        fieldPaths.forEach((fieldPath) => {
            const decoder = this._serializer.getDecoderForFieldPath(fieldPath);

            const value = decoder.decode(this._bitBuffer);

            mutations.push(new EntityMutation(fieldPath, value));
        });

        return mutations;
    }
}

export default EntityMutationExtractor;
