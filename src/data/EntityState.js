'use strict';

const FieldPathExtractor = require('./../extractors/FieldPathExtractor');

class EntityState extends Array {
    constructor(...args) {
        super(...args);
    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     * @param {Serializer} serializer
     */
    updateFromBitBuffer(bitBuffer, serializer) {
        const extractor = new FieldPathExtractor(bitBuffer);

        const fieldPaths = extractor.all();

        fieldPaths.forEach((fieldPath) => {
            const decoder = serializer.getDecoderForFieldPath(fieldPath);

            const value = decoder.decode(bitBuffer);

            this.updateByFieldPath(fieldPath, value);
        });
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    updateByFieldPath(fieldPath, value) {
        let state = this;

        for (let i = 0; i < fieldPath.length; i++) {
            const index = fieldPath.get(i);

            const isLast = i === fieldPath.length - 1;

            if (isLast) {
                state[index] = value;

                return;
            }

            state[index] = new EntityState();

            state = state[index];
        }
    }
}

module.exports = EntityState;
