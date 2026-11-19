/** @import { DescMessage } from '@bufbuild/protobuf' */
/** @import ProtoDecoder from './ProtoDecoder.js' */

import { ScalarType } from '@bufbuild/protobuf';
import { BinaryWriter, WireType } from '@bufbuild/protobuf/wire';

import Assert from '../Assert.js';

import ProtoField from './ProtoField.js';

/** @type {WeakMap<DescMessage, ProtoEncoder>} */
const encoders = new WeakMap();

/**
 * Encodes protobuf messages by walking their descriptors. Writes only the own properties of a message, not the defaults on its prototype.
 *
 * The counterpart of {@link ProtoDecoder}.
 */
class ProtoEncoder {
    /** @private @type {DescMessage} */
    _descriptor;

    /** @private @type {Array<ProtoField|null>} */
    _fields;

    /** @private @type {Array<ProtoEncoder|null>} */
    _nested;

    /**
     * @constructor
     * @param {DescMessage} descriptor
     */
    constructor(descriptor) {
        Assert.isTrue(descriptor?.kind === 'message');

        const size = descriptor.fields.reduce((maximum, field) => Math.max(maximum, field.number), 0) + 1;

        this._descriptor = descriptor;
        this._fields = new Array(size).fill(null);
        this._nested = new Array(size).fill(null);

        for (const descriptorField of descriptor.fields) {
            this._fields[descriptorField.number] = new ProtoField(descriptorField);
        }
    }

    /**
     * Returns a cached encoder for the descriptor.
     *
     * @public
     * @static
     * @param {DescMessage} descriptor
     * @returns {ProtoEncoder}
     */
    static fromDescriptor(descriptor) {
        let encoder = encoders.get(descriptor);

        if (encoder === undefined) {
            encoder = new ProtoEncoder(descriptor);

            encoders.set(descriptor, encoder);
        }

        return encoder;
    }

    /**
     * @public
     * @returns {DescMessage}
     */
    get descriptor() {
        return this._descriptor;
    }

    /**
     * @public
     * @param {Record<string, *>} message
     * @returns {Uint8Array}
     */
    encode(message) {
        const writer = new BinaryWriter();

        this._encode(writer, message);

        return writer.finish();
    }

    /**
     * @public
     * @param {number} number
     * @returns {ProtoEncoder}
     */
    getNestedEncoder(number) {
        const encoder = this._nested[number];

        return encoder !== null ? encoder : this._resolveNestedEncoder(number);
    }

    /**
     * Writes one scalar or enum value without its tag.
     *
     * @public
     * @param {ProtoField} field
     * @param {BinaryWriter} writer
     * @param {*} value
     * @returns {BinaryWriter}
     */
    writeScalar(field, writer, value) {
        switch (field.scalar) {
            case ScalarType.UINT32:
                return writer.uint32(value);
            case ScalarType.INT32:
                return writer.int32(value);
            case ScalarType.FLOAT:
                return writer.float(value);
            case ScalarType.BOOL:
                return writer.bool(value);
            case ScalarType.BYTES:
                return writer.bytes(value);
            case ScalarType.STRING:
                return writer.string(value);
            case ScalarType.DOUBLE:
                return writer.double(value);
            case ScalarType.INT64:
                return writer.int64(value);
            case ScalarType.UINT64:
                return writer.uint64(value);
            case ScalarType.FIXED64:
                return writer.fixed64(value);
            case ScalarType.FIXED32:
                return writer.fixed32(value);
            case ScalarType.SFIXED32:
                return writer.sfixed32(value);
            case ScalarType.SFIXED64:
                return writer.sfixed64(value);
            case ScalarType.SINT32:
                return writer.sint32(value);
            case ScalarType.SINT64:
                return writer.sint64(value);
            default:
                throw new Error(`Unsupported scalar [ ${field.scalar} ] of field [ ${field.name} ]`);
        }
    }

    /**
     * Writes the own fields that have a value, in the order of their numbers.
     *
     * @private
     * @param {BinaryWriter} writer
     * @param {Record<string, *>} message
     */
    _encode(writer, message) {
        for (let number = 1; number < this._fields.length; number++) {
            const field = this._fields[number];

            if (field === null || !Object.hasOwn(message, field.name)) {
                continue;
            }

            const value = message[field.name];

            if (value === undefined || value === null) {
                continue;
            }

            if (!field.repeated) {
                this._writeValue(writer, field, value);
            } else if (field.packed) {
                writer.tag(number, WireType.LengthDelimited).fork();

                for (let i = 0; i < value.length; i++) {
                    this.writeScalar(field, writer, value[i]);
                }

                writer.join();
            } else {
                for (let i = 0; i < value.length; i++) {
                    this._writeValue(writer, field, value[i]);
                }
            }
        }
    }

    /**
     * @private
     * @param {number} number
     * @returns {ProtoEncoder}
     */
    _resolveNestedEncoder(number) {
        const field = this._fields[number];

        Assert.isTrue(field !== null && field.message !== null, `Field [ ${number} ] of [ ${this._descriptor.typeName} ] is not a message`);

        const encoder = ProtoEncoder.fromDescriptor(/** @type {DescMessage} */ (field.message));

        this._nested[number] = encoder;

        return encoder;
    }

    /**
     * Writes the tag and one value of the field: a scalar, an enum or a nested message.
     *
     * @private
     * @param {BinaryWriter} writer
     * @param {ProtoField} field
     * @param {*} value
     */
    _writeValue(writer, field, value) {
        writer.tag(field.number, field.wireType);

        if (field.message === null) {
            this.writeScalar(field, writer, value);

            return;
        }

        writer.fork();

        this.getNestedEncoder(field.number)._encode(writer, value);

        writer.join();
    }
}

export default ProtoEncoder;
