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
     * @param {FieldPath} _fieldPath
     * @param {number} _index
     * @returns {FieldDecoderFn}
     */
    getDecoderForFieldPath(_fieldPath, _index) {
        throw new Error('Abstract: getDecoderForFieldPath()');
    }

    /**
     * @public
     * @param {FieldPath} _fieldPath
     * @param {number} _index
     * @returns {FieldDefinition}
     */
    getDefinitionForFieldPath(_fieldPath, _index) {
        return this._definition;
    }

    /**
     * Returns `true` when the field path addresses a container's base slot (not a leaf).
     *
     * @abstract
     * @public
     * @param {FieldPath} _fieldPath
     * @param {number} _index
     * @returns {boolean}
     */
    getIsContainerForFieldPath(_fieldPath, _index) {
        throw new Error('Abstract: getIsContainerForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} _fieldPath
     * @param {number} [_index=0]
     * @returns {string}
     */
    getNameForFieldPath(_fieldPath, _index = 0) {
        throw new Error('Abstract: getNameForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} _fieldPath
     * @param {number} _index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath(_fieldPath, _index) {
        throw new Error('Abstract: getStorageForFieldPath()');
    }

    /**
     * Unpacks the entire field starting from the position the [extractor]
     * currently points to.
     *
     * @abstract
     * @public
     * @param {FieldExtractor} _extractor
     * @returns {*}
     */
    unpack(_extractor) {
        throw new Error('Abstract: unpack()');
    }

    /**
     * Unpacks a single element at [index] within this field. The default
     * delegates to {@link #unpack}. Override for array and table fields.
     *
     * @public
     * @param {FieldExtractor} extractor
     * @param {number} _index
     * @returns {*}
     */
    unpackElement(extractor, _index) {
        return this.unpack(extractor);
    }
}

export default Field;
