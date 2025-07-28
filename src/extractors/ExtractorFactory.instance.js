import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

class ExtractorFactory {
    constructor() {

    }

    static instance = new ExtractorFactory();

    createForFieldPath(bitBuffer) {
        return this._createForFieldPath(bitBuffer);
    }

    createForMutation() {
        return this._createForMutation();
    }

    createForMutationPacked() {
        return this._createForMutationPacked();
    }

    _createForFieldPath(bitBuffer) {
        return () => {
            const fieldPathBuilder = new FieldPathBuilder();

            const fieldPaths = [ ];

            let fieldPath;

            return fieldPaths;
        };
    }

    _createForMutation() {

    }

    _createForMutationPacked() {

    }
}

export default ExtractorFactory.instance;
