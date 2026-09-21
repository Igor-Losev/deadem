import Assert from '../core/Assert.js';
import WireReader from '../core/WireReader.js';

const TAG_SHIFT = 3;
const TAG_MASK = 0x07;

const WIRE_VAR_INT = 0;
const WIRE_FIXED_64 = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_FIXED_32 = 5;
const WIRE_RESET = 7;

const textDecoder = new TextDecoder();

/**
 * A decoded protobuf message held as a plain record.
 *
 * @typedef {Record<string, *>} ProtoState
 */

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

        /** @private */
        this._reader = new WireReader(data);
        /** @private */
        this._type = type;
    }

    /**
     * Merges extracted data into the given state.
     *
     * @public
     * @param {ProtoState} state
     * @returns {ProtoState}
     */
    merge(state) {
        return this._merge(state, this._type, this._reader.getUnreadCount());
    }

    /**
     * @protected
     * @param {ProtoState} state
     * @param {protobuf.Type} type
     * @param {number} length
     * @returns {ProtoState}
     */
    _merge(state, type, length) {
        const reader = this._reader;

        const end = reader.offset + length;

        while (reader.offset < end) {
            const tag = reader.readUVarInt32();

            const id = tag >>> TAG_SHIFT;
            const wire = tag & TAG_MASK;

            const field = type.fieldsById[id] || null;

            if (field !== null && field.repeated && wire !== WIRE_LENGTH_DELIMITED && wire !== WIRE_RESET) {
                throw new Error(`DeltaExtractor: repeated field [ ${field.name} ] via scalar wire type [ ${wire} ]`);
            }

            switch (wire) {
                case WIRE_VAR_INT:
                    if (field === null) {
                        reader.readUVarInt64();
                    } else if (field.type === 'bool') {
                        state[field.name] = reader.readBoolean();
                    } else if (field.type === 'int32') {
                        state[field.name] = reader.readVarInt32();
                    } else if (field.type === 'uint32') {
                        state[field.name] = reader.readUVarInt32();
                    } else if (field.type === 'uint64') {
                        state[field.name] = reader.readUVarInt64().toString();
                    } else {
                        throw new Error(`DeltaExtractor: unsupported varint type [ ${field.type} ] for field [ ${field.name} ]`);
                    }

                    break;
                case WIRE_FIXED_64:
                    if (field === null) {
                        reader.readUInt64();
                    } else if (field.type === 'double') {
                        throw new Error(`DeltaExtractor: unsupported double field [ ${field.name} ]`);
                    } else {
                        state[field.name] = reader.readUInt64().toString();
                    }

                    break;
                case WIRE_LENGTH_DELIMITED: {
                    const payload = reader.readUVarInt32();

                    if (field === null) {
                        reader.offset += payload;
                    } else if (field.repeated) {
                        if (!field.resolvedType) {
                            throw new Error(`DeltaExtractor: unsupported repeated scalar field [ ${field.name} ]`);
                        }

                        state[field.name] = this._mergeRepeated(state[field.name], /** @type {protobuf.Type} */ (field.resolvedType), payload);
                    } else if (field.resolvedType) {
                        state[field.name] = this._merge(state[field.name] || { }, /** @type {protobuf.Type} */ (field.resolvedType), payload);
                    } else if (field.bytes) {
                        state[field.name] = new Uint8Array(reader.read(payload));
                    } else if (field.type === 'string') {
                        state[field.name] = textDecoder.decode(reader.read(payload));
                    } else {
                        throw new Error(`DeltaExtractor: unsupported length-delimited type [ ${field.type} ] for field [ ${field.name} ]`);
                    }

                    break;
                }
                case WIRE_FIXED_32:
                    if (field === null) {
                        reader.readUInt32();
                    } else if (field.type === 'float') {
                        state[field.name] = reader.readFloat32();
                    } else {
                        state[field.name] = reader.readUInt32();
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
     * @param {Array<ProtoState>|undefined} previous
     * @param {protobuf.Type} type
     * @param {number} length
     * @returns {Array<ProtoState>}
     */
    _mergeRepeated(previous, type, length) {
        const reader = this._reader;

        const end = reader.offset + length;

        const updates = [ ];

        let declared = null;
        let highest = -1;

        while (reader.offset < end) {
            const tag = reader.readUVarInt32();

            const index = tag >>> TAG_SHIFT;
            const wire = tag & TAG_MASK;

            if (wire === WIRE_RESET) {
                declared = index;

                continue;
            }

            if (wire !== WIRE_LENGTH_DELIMITED) {
                throw new Error(`DeltaExtractor: unsupported wire type [ ${wire} ] in a repeated field`);
            }

            const element = reader.readUVarInt32();

            updates[index] = this._merge(previous?.[index] || { }, type, element);

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
        const remaining = end - this._reader.offset;

        if (remaining < 0) {
            throw new Error(`DeltaExtractor: read [ ${-remaining} ] byte(s) past the end of a sub-payload`);
        }

        this._reader.offset = end;
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
