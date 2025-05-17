'use strict';

const FieldPathExtractor = require('./../extractors/FieldPathExtractor');

class EntityState extends Array {
    constructor(...args) {
        super(...args);
    }

    getValue() {

    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     * @param {Serializer} serializer
     */
    read(bitBuffer, serializer) {
        const extractor = new FieldPathExtractor(bitBuffer);
        const generator = extractor.retrieve();

        const fieldPaths = [ ];

        for (const fieldPath of generator) {
            fieldPaths.push(fieldPath);
        }

        fieldPaths.forEach((fieldPath) => {
            const decoder = serializer.getDecoderForFieldPath(fieldPath);

            const value = decoder.decode(bitBuffer);

            this.setValue(fieldPath, value);
        });
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    setValue(fieldPath, value) {
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
