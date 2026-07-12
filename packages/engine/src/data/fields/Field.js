/** @import FieldModel from '#data/enums/FieldModel.js' */

/** @import FieldPath from './path/FieldPath.js' */
/** @import FieldStorageDescriptor from './decoding/FieldStorageDescriptor.js' */

/** @import FieldExtractor from './FieldExtractor.js' */
/** @import { FieldDecoderFn } from '#data/fields/decoding/FieldDecoder.js' */

import Assert from '#core/Assert.js';

import FieldDefinition from './FieldDefinition.js';

class Field {
    /**
     * @public
     * @constructor
     * @param {string} name
     * @param {Array<string>} sendNode
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
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Array<string>}
     */
    get sendNode() {
        return this._sendNode;
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldDecoderFn}
     */
    getDecoderForFieldPath(fieldPath, index) {
        throw new Error('Abstract: getDecoderForFieldPath()');
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldDefinition}
     */
    getDefinitionForFieldPath(fieldPath, index) {
        return this._definition;
    }

    /**
     * Returns `true` when the field path addresses a container's base slot (not a leaf).
     *
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {boolean}
     */
    getIsContainerForFieldPath(fieldPath, index) {
        throw new Error('Abstract: getIsContainerForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [index=0]
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        throw new Error('Abstract: getNameForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(fieldPath, index) {
        throw new Error('Abstract: getStorageForFieldPath()');
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
    unpack(extractor) {
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
    unpackElement(extractor, index) {
        return this.unpack(extractor);
    }
}

export default Field;
