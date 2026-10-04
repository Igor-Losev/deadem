/** @import { DescMessage } from '@bufbuild/protobuf' */

import { ScalarType } from '@bufbuild/protobuf';
import { WireType } from '@bufbuild/protobuf/wire';

import Assert from '../Assert.js';

import ProtoField from './ProtoField.js';
import ProtoWireReader from './ProtoWireReader.js';

/** @type {WeakMap<DescMessage, ProtoDecoder>} */
const decoders = new WeakMap();

/**
 * Decodes protobuf messages by walking their descriptors.
 */
class ProtoDecoder {
    /**
     * @constructor
     * @param {DescMessage} descriptor
     */
    constructor(descriptor) {
        Assert.isTrue(descriptor?.kind === 'message');

        const Message = class { };
        const prototype = /** @type {Record<string, *>} */ (Message.prototype);

        Object.defineProperty(prototype, '$typeName', { value: descriptor.typeName });

        const size = descriptor.fields.reduce((maximum, field) => Math.max(maximum, field.number), 0) + 1;

        /** @type {Array<ProtoField|null>} */
        const fields = new Array(size).fill(null);

        for (const descriptorField of descriptor.fields) {
            const field = new ProtoField(descriptorField);

            fields[descriptorField.number] = field;
            prototype[field.name] = field.defaultValue;
        }

        /** @private */
        this._descriptor = descriptor;
        /** @private */
        this._messageClass = Message;
        /** @private */
        this._fields = fields;
        /**
         * @private
         * @type {Array<ProtoDecoder|null>}
         */
        this._nested = new Array(size).fill(null);
    }

    /**
     * Returns a cached decoder for the descriptor.
     *
     * @public
     * @static
     * @param {DescMessage} descriptor
     * @returns {ProtoDecoder}
     */
    static fromDescriptor(descriptor) {
        let decoder = decoders.get(descriptor);

        if (decoder === undefined) {
            decoder = new ProtoDecoder(descriptor);

            decoders.set(descriptor, decoder);
        }

        return decoder;
    }

    /**
     * @public
     * @returns {DescMessage}
     */
    get descriptor() {
        return this._descriptor;
    }

    /**
     * Creates an empty message with default values.
     *
     * @public
     * @returns {Record<string, *>}
     */
    create() {
        return new this._messageClass();
    }

    /**
     * @public
     * @param {Uint8Array} buffer
     * @returns {Record<string, *>}
     */
    decode(buffer) {
        const reader = new ProtoWireReader(buffer);

        return this._decode(reader, reader.length, 0);
    }

    /**
     * @public
     * @param {number} number
     * @returns {ProtoField|null}
     */
    getField(number) {
        return number < this._fields.length ? this._fields[number] : null;
    }

    /**
     * @public
     * @param {number} number
     * @returns {ProtoDecoder}
     */
    getNestedDecoder(number) {
        const decoder = this._nested[number];

        return decoder !== null ? decoder : this._resolveNestedDecoder(number);
    }

    /**
     * Reads one scalar or enum value after its tag.
     *
     * @public
     * @param {ProtoField} field
     * @param {ProtoWireReader} reader
     * @returns {*}
     */
    readScalar(field, reader) {
        switch (field.scalar) {
            case ScalarType.UINT32:
                return reader.readUVarInt32();
            case ScalarType.INT32:
                return reader.readVarInt32();
            case ScalarType.FLOAT:
                return reader.readFloat32();
            case ScalarType.BOOL:
                return reader.readBoolean();
            case ScalarType.BYTES:
                return reader.readBytes();
            case ScalarType.STRING:
                return reader.readString();
            case ScalarType.DOUBLE:
                return reader.readFloat64();
            case ScalarType.INT64:
                return reader.readVarInt64();
            case ScalarType.UINT64:
                return reader.readUVarInt64();
            case ScalarType.FIXED64:
                return reader.readUInt64();
            case ScalarType.FIXED32:
                return reader.readUInt32();
            case ScalarType.SFIXED32:
                return reader.readInt32();
            case ScalarType.SFIXED64:
                return reader.readInt64();
            case ScalarType.SINT32:
                return reader.readZigZag32();
            case ScalarType.SINT64:
                return reader.readZigZag64();
            default:
                throw new Error(`Unsupported scalar [ ${field.scalar} ] of field [ ${field.name} ]`);
        }
    }

    /**
     * @private
     * @param {ProtoWireReader} reader
     * @param {number} end
     * @param {number} depth
     * @returns {Record<string, *>}
     */
    _decode(reader, end, depth) {
        if (depth > ProtoWireReader.RECURSION_LIMIT) {
            throw new Error(`Unexpected message depth [ ${depth} ]`);
        }

        /** @type {Record<string, *>} */
        const message = new this._messageClass();
        const fields = this._fields;

        while (reader.offset < end) {
            const tag = reader.readUVarInt32();
            const number = tag >>> 3;
            const wire = tag & 7;
            const field = number < fields.length ? fields[number] : null;

            if (field === null) {
                reader.skip(wire);
            } else if (wire === field.wireType) {
                const value = field.message !== null
                    ? this.getNestedDecoder(number)._decode(reader, reader.readUVarInt32() + reader.offset, depth + 1)
                    : this.readScalar(field, reader);

                if (!field.repeated) {
                    message[field.name] = value;
                } else if (message[field.name] === field.defaultValue) {
                    message[field.name] = [ value ];
                } else {
                    message[field.name].push(value);
                }
            } else if (wire === WireType.LengthDelimited && field.repeated && field.message === null) {
                const packedEnd = reader.readUVarInt32() + reader.offset;
                const values = message[field.name] === field.defaultValue ? (message[field.name] = [ ]) : message[field.name];

                while (reader.offset < packedEnd) {
                    values.push(this.readScalar(field, reader));
                }
            } else {
                reader.skip(wire);
            }
        }

        return message;
    }

    /**
     * @private
     * @param {number} number
     * @returns {ProtoDecoder}
     */
    _resolveNestedDecoder(number) {
        const field = this._fields[number];

        Assert.isTrue(field !== null && field.message !== null, `Field [ ${number} ] of [ ${this._descriptor.typeName} ] is not a message`);

        const decoder = ProtoDecoder.fromDescriptor(/** @type {DescMessage} */ (field.message));

        this._nested[number] = decoder;

        return decoder;
    }
}

export default ProtoDecoder;
