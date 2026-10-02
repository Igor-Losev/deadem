/** @import { DescField, DescMessage } from '@bufbuild/protobuf' */

import { ScalarType } from '@bufbuild/protobuf';
import { WireType } from '@bufbuild/protobuf/wire';

import Assert from '../Assert.js';

const EMPTY_BYTES = new Uint8Array(0);

/** @type {ReadonlyArray<*>} */
const EMPTY_LIST = Object.freeze([ ]);

/**
 * A message field as {@link ProtoDecoder} reads it.
 */
class ProtoField {
    /**
     * @constructor
     * @param {DescField} descriptor
     */
    constructor(descriptor) {
        const path = `${descriptor.parent.typeName}.${descriptor.name}`;

        Assert.isTrue(descriptor.fieldKind !== 'map', `Unsupported map field [ ${path} ]`);
        Assert.isTrue(descriptor.oneof === undefined, `Unsupported oneof field [ ${path} ]`);
        Assert.isTrue(!('delimitedEncoding' in descriptor && descriptor.delimitedEncoding), `Unsupported group field [ ${path} ]`);

        const message = descriptor.message ?? null;
        const scalar = descriptor.scalar ?? (descriptor.enum !== undefined ? ScalarType.INT32 : null);

        /** @private */
        this._name = descriptor.localName;
        /** @private */
        this._repeated = descriptor.fieldKind === 'list';
        /** @private */
        this._message = message;
        /** @private */
        this._scalar = scalar;
        /** @private */
        this._wireType = message !== null ? WireType.LengthDelimited : ProtoField._getWireType(scalar);
        /** @private */
        this._defaultValue = ProtoField._getDefaultValue(descriptor);
    }

    /**
     * Property name of the field on a decoded message.
     *
     * @public
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get repeated() {
        return this._repeated;
    }

    /**
     * Descriptor of the value message; `null` for scalars and enums.
     *
     * @public
     * @returns {DescMessage|null}
     */
    get message() {
        return this._message;
    }

    /**
     * Scalar a single value travels as, enums as `int32`; `null` for messages.
     *
     * @public
     * @returns {ScalarType|null}
     */
    get scalar() {
        return this._scalar;
    }

    /**
     * Wire type of a single value.
     *
     * @public
     * @returns {WireType}
     */
    get wireType() {
        return this._wireType;
    }

    /**
     * Value of the field on a message that does not carry it.
     *
     * @public
     * @returns {*}
     */
    get defaultValue() {
        return this._defaultValue;
    }

    /**
     * @private
     * @static
     * @param {ScalarType|null} scalar
     * @returns {WireType}
     */
    static _getWireType(scalar) {
        switch (scalar) {
            case ScalarType.DOUBLE:
            case ScalarType.FIXED64:
            case ScalarType.SFIXED64:
                return WireType.Bit64;
            case ScalarType.FLOAT:
            case ScalarType.FIXED32:
            case ScalarType.SFIXED32:
                return WireType.Bit32;
            case ScalarType.STRING:
            case ScalarType.BYTES:
                return WireType.LengthDelimited;
            default:
                return WireType.Varint;
        }
    }

    /**
     * @private
     * @static
     * @param {DescField} descriptor
     * @returns {*}
     */
    static _getDefaultValue(descriptor) {
        switch (descriptor.fieldKind) {
            case 'list':
                return EMPTY_LIST;
            case 'enum':
                return descriptor.getDefaultValue() ?? descriptor.enum.values[0].number;
            case 'scalar':
                return descriptor.getDefaultValue() ?? ProtoField._getZeroValue(descriptor.scalar);
            default:
                return undefined;
        }
    }

    /**
     * @private
     * @static
     * @param {ScalarType} scalar
     * @returns {*}
     */
    static _getZeroValue(scalar) {
        switch (scalar) {
            case ScalarType.INT64:
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                return 0n;
            case ScalarType.BOOL:
                return false;
            case ScalarType.STRING:
                return '';
            case ScalarType.BYTES:
                return EMPTY_BYTES;
            default:
                return 0;
        }
    }
}

export default ProtoField;
