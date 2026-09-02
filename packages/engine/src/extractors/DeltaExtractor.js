import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';

const BITS_PER_BYTE = BitBuffer.BITS_PER_BYTE;

const TAG_SHIFT = 3;
const TAG_MASK = 0x07;

const WIRE_VAR_INT = 0;
const WIRE_FIXED_64 = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_FIXED_32 = 5;
const WIRE_RESET = 7;

const textDecoder = new TextDecoder();

/**
 * Extractor `codegen_delta_encoder` protobuf extension.
 */
class DeltaExtractor {
    /**
     * @public
     * @constructor
     * @param {Uint8Array} data
     * @param {protobuf.Type} type
     */
    constructor(data, type) {
        Assert.isTrue(data instanceof Uint8Array);
        Assert.isTrue(type?.fieldsById !== undefined);

        this._bitBuffer = new BitBuffer(data);
        this._type = type;
    }

    /**
     * Merges extracted data into the given state.
     *
     * @public
     * @param {Object} state
     * @returns {Object}
     */
    merge(state) {
        return this._merge(state, this._type, this._bitBuffer.getUnreadCount());
    }

    /**
     * @protected
     * @param {Object} state
     * @param {protobuf.Type} type
     * @param {number} bits
     * @returns {Object}
     */
    _merge(state, type, bits) {
        const bitBuffer = this._bitBuffer;

        const end = bitBuffer.getReadCount() + bits;

        while (end - bitBuffer.getReadCount() >= BITS_PER_BYTE) {
            const tag = bitBuffer.readUVarInt32();

            const id = tag >>> TAG_SHIFT;
            const wire = tag & TAG_MASK;

            const field = type.fieldsById[id] || null;

            if (field !== null && field.repeated && wire !== WIRE_LENGTH_DELIMITED && wire !== WIRE_RESET) {
                throw new Error(`DeltaExtractor: repeated field [ ${field.name} ] via scalar wire type [ ${wire} ]`);
            }

            switch (wire) {
                case WIRE_VAR_INT:
                    if (field === null) {
                        bitBuffer.readUVarInt64();
                    } else if (field.type === 'bool') {
                        state[field.name] = bitBuffer.readUVarInt32() !== 0;
                    } else if (field.type === 'int32') {
                        state[field.name] = bitBuffer.readUVarInt32() | 0;
                    } else if (field.type === 'uint32') {
                        state[field.name] = bitBuffer.readUVarInt32();
                    } else if (field.type === 'uint64') {
                        state[field.name] = bitBuffer.readUVarInt64().toString();
                    } else {
                        throw new Error(`DeltaExtractor: unsupported varint type [ ${field.type} ] for field [ ${field.name} ]`);
                    }

                    break;
                case WIRE_FIXED_64:
                    if (field === null) {
                        bitBuffer.readUInt64();
                    } else if (field.type === 'double') {
                        throw new Error(`DeltaExtractor: unsupported double field [ ${field.name} ]`);
                    } else {
                        state[field.name] = bitBuffer.readUInt64().toString();
                    }

                    break;
                case WIRE_LENGTH_DELIMITED: {
                    const payloadBits = bitBuffer.readUVarInt32() * BITS_PER_BYTE;

                    if (field === null) {
                        bitBuffer.move(payloadBits);
                    } else if (field.repeated) {
                        if (!field.resolvedType) {
                            throw new Error(`DeltaExtractor: unsupported repeated scalar field [ ${field.name} ]`);
                        }

                        state[field.name] = this._mergeRepeated(state[field.name], field.resolvedType, payloadBits);
                    } else if (field.resolvedType) {
                        state[field.name] = this._merge(state[field.name] || { }, field.resolvedType, payloadBits);
                    } else if (field.bytes) {
                        state[field.name] = new Uint8Array(bitBuffer.readBytes(payloadBits / BITS_PER_BYTE));
                    } else if (field.type === 'string') {
                        state[field.name] = textDecoder.decode(bitBuffer.readBytes(payloadBits / BITS_PER_BYTE));
                    } else {
                        throw new Error(`DeltaExtractor: unsupported length-delimited type [ ${field.type} ] for field [ ${field.name} ]`);
                    }

                    break;
                }
                case WIRE_FIXED_32:
                    if (field === null) {
                        bitBuffer.readUInt32();
                    } else if (field.type === 'float') {
                        state[field.name] = bitBuffer.readFloat32();
                    } else {
                        state[field.name] = bitBuffer.readUInt32();
                    }

                    break;
                case WIRE_RESET:
                    if (field === null) {
                        break;
                    }

                    if (field.repeated) {
                        state[field.name] = [ ];
                    } else if (field.resolvedType) {
                        delete state[field.name];
                    } else {
                        state[field.name] = getDefaultValue(field);
                    }

                    break;
                default:
                    throw new Error(`DeltaExtractor: unsupported wire type [ ${wire} ]`);
            }
        }

        this._seek(end);

        return state;
    }

    /**
     * @protected
     * @param {Array<Object>|undefined} previous
     * @param {protobuf.Type} type
     * @param {number} bits
     * @returns {Array<Object>}
     */
    _mergeRepeated(previous, type, bits) {
        const bitBuffer = this._bitBuffer;

        const end = bitBuffer.getReadCount() + bits;

        const updates = [ ];

        let declared = null;
        let highest = -1;

        while (end - bitBuffer.getReadCount() >= BITS_PER_BYTE) {
            const tag = bitBuffer.readUVarInt32();

            const index = tag >>> TAG_SHIFT;
            const wire = tag & TAG_MASK;

            if (wire === WIRE_RESET) {
                declared = index;

                continue;
            }

            if (wire !== WIRE_LENGTH_DELIMITED) {
                throw new Error(`DeltaExtractor: unsupported wire type [ ${wire} ] in a repeated field`);
            }

            const elementBits = bitBuffer.readUVarInt32() * BITS_PER_BYTE;

            updates[index] = this._merge(previous?.[index] || { }, type, elementBits);

            if (index > highest) {
                highest = index;
            }
        }

        this._seek(end);

        if (declared !== null && declared < highest + 1) {
            throw new Error(`DeltaExtractor: repeated field declares [ ${declared} ] element(s) but carries index [ ${highest} ]`);
        }

        const count = declared === null ? highest + 1 : declared;
        const elements = new Array(count);

        for (let i = 0; i < count; i++) {
            elements[i] = updates[i] || previous?.[i] || { };
        }

        return elements;
    }

    /**
     * @protected
     * @param {number} end
     */
    _seek(end) {
        const remaining = end - this._bitBuffer.getReadCount();

        if (remaining < 0) {
            throw new Error(`DeltaExtractor: read [ ${-remaining} ] bit(s) past the end of a sub-payload`);
        }

        this._bitBuffer.move(remaining);
    }
}

/**
 * @param {protobuf.Field} field
 * @returns {boolean|number|string|Uint8Array}
 */
function getDefaultValue(field) {
    const value = field.typeDefault;

    if (Array.isArray(value)) {
        return new Uint8Array(value);
    }

    if (value !== null && typeof value === 'object') {
        return value.toString();
    }

    return value;
}

export default DeltaExtractor;
