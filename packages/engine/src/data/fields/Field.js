/** @import FieldModel from '../enums/FieldModel.js' */

/** @import FieldPath from './path/FieldPath.js' */
/** @import FieldStorageDescriptor from './decoding/FieldStorageDescriptor.js' */

/** @import FieldExtractor from './FieldExtractor.js' */
/** @import { FieldDecoderFn } from './decoding/FieldDecoder.js' */

import Assert from '../../core/Assert.js';

import FieldDefinition from './FieldDefinition.js';

const NAME_DELIMITER = '.';

class Field {
    /**
     * @public
     * @constructor
     * @param {Array<string>} sendNode
     * @param {string} varName
     * @param {FieldDefinition} definition
     */
    constructor(sendNode, varName, definition) {
        Assert.isTrue(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));
        Assert.isTrue(typeof varName === 'string');
        Assert.isTrue(definition instanceof FieldDefinition);

        /** @private */
        this._sendNode = sendNode;
        /** @private */
        this._varName = varName;
        /** @protected */
        this._definition = definition;

        const segments = [ ...sendNode, varName ];

        /** @protected */
        this._name = Field.joinName(segments);
        /** @protected */
        this._segments = segments;
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
     * E.g. `m_vecViewOffset.m_vecX`.
     *
     * @public
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * E.g. `[ 'm_vecViewOffset', 'm_vecX' ]`.
     *
     * @public
     * @returns {Array<string>}
     */
    get segments() {
        return this._segments;
    }

    /**
     * E.g. `[ 'm_vecViewOffset' ]`, empty for a top-level field.
     *
     * @public
     * @returns {Array<string>}
     */
    get sendNode() {
        return this._sendNode;
    }

    /**
     * E.g. `m_vecX`.
     *
     * @public
     * @returns {string}
     */
    get varName() {
        return this._varName;
    }

    /**
     * [ 'm_vecViewOffset', 'm_vecX' ] -> 'm_vecViewOffset.m_vecX'
     *
     * @public
     * @static
     * @param {Array<string>} segments
     * @returns {string}
     */
    static joinName(segments) {
        return segments.join(NAME_DELIMITER);
    }

    /**
     * 'm_vecViewOffset.m_vecX' -> [ 'm_vecViewOffset', 'm_vecX' ]
     *
     * @public
     * @static
     * @param {string} name
     * @returns {Array<string>}
     */
    static splitName(name) {
        return name.split(NAME_DELIMITER);
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
     * Returns `true` when `segments` start with the field name.
     *
     * @public
     * @param {Array<string>} segments
     * @returns {boolean}
     */
    getIsPrefixOf(segments) {
        for (let i = 0; i < this._segments.length; i++) {
            if (segments[i] !== this._segments[i]) {
                return false;
            }
        }

        return true;
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
     * Unpacks the whole field from the current position of the extractor.
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
     * Unpacks one element of this field. By default calls {@link #unpack}.
     * Override for array and table fields.
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
