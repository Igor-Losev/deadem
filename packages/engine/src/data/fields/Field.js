import Assert from '#core/Assert.js';

import FieldDefinition from './FieldDefinition.js';

class Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     * @param {FieldDefinition} definition
     */
    constructor(name, sendNode, definition) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));
        Assert.isTrue(definition instanceof FieldDefinition);

        this._name = name;
        this._sendNode = sendNode;
        this._definition = definition;
    }

    /**
     * @public
     * @returns {FieldDefinition}
     */
    get definition() {
        return this._definition;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        throw new Error('Abstract: get model()');
    }

    /**
     * @public
     * @returns {String}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Array<String>}
     */
    get sendNode() {
        return this._sendNode;
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {Function}
     */
    getDecoderForFieldPath() {
        throw new Error('Abstract: getDecoderForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath() {
        throw new Error('Abstract: getStorageForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @returns {String}
     */
    getNameForFieldPath() {
        throw new Error('Abstract: getNameForFieldPath()');
    }

    /**
     * Unpacks the entire field starting from the position the [extractor]
     * currently points to.
     *
     * @abstract
     * @public
     * @param {FieldExtractor} extractor
     * @returns {*}
     */
    unpack() {
        throw new Error('Abstract: unpack()');
    }

    /**
     * Unpacks a single element at [index] within this field. The default
     * delegates to {@link #unpack}. Override for array and table fields.
     *
     * @public
     * @param {FieldExtractor} extractor
     * @param {number} index
     * @returns {*}
     */
    unpackElement(extractor, _index) {
        return this.unpack(extractor);
    }
}

export default Field;
