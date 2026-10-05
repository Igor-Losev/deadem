import { ScalarType } from '@bufbuild/protobuf';
import { WireType } from '@bufbuild/protobuf/wire';

import Assert from '../core/Assert.js';

import ProtoDecoder from '../core/proto/ProtoDecoder.js';
import ProtoWireReader from '../core/proto/ProtoWireReader.js';

const TAG_SHIFT = 3;
const TAG_MASK = 0x07;

const WIRE_RESET = 7;

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
     * @param {ProtoDecoder} decoder
     */
    constructor(data, decoder) {
        Assert.isTrue(data instanceof Uint8Array);
        Assert.isTrue(decoder instanceof ProtoDecoder);

        /** @private */
        this._reader = new ProtoWireReader(data);
        /** @private */
        this._decoder = decoder;
    }

    /**
     * Merges extracted data into the given state.
     *
     * @public
     * @param {ProtoState} state
     * @returns {ProtoState}
     */
    merge(state) {
        return this._merge(state, this._decoder, this._reader.getUnreadCount(), true);
    }

    /**
     * Fields that the delta carries, without defaults.
     *
     * @public
     * @returns {ProtoState}
     */
    extract() {
        return this._merge({ }, this._decoder, this._reader.getUnreadCount(), false);
    }

    /**
     * @protected
     * @param {ProtoState} state
     * @param {ProtoDecoder} decoder
     * @param {number} length
     * @param {boolean} defaults
     * @returns {ProtoState}
     */
    _merge(state, decoder, length, defaults) {
        const reader = this._reader;

        const end = reader.offset + length;

        while (reader.offset < end) {
            const tag = reader.readUVarInt32();

            const number = tag >>> TAG_SHIFT;
            const wire = tag & TAG_MASK;

            const field = decoder.getField(number);

            if (field === null) {
                if (wire !== WIRE_RESET) {
                    reader.skip(wire);
                }
            } else if (wire === WIRE_RESET) {
                if (field.repeated) {
                    state[field.name] = [ ];
                } else if (field.message !== null) {
                    delete state[field.name];
                } else {
                    state[field.name] = field.defaultValue;
                }
            } else if (field.message !== null && wire === WireType.LengthDelimited) {
                const nested = decoder.getNestedDecoder(number);
                const payload = reader.readUVarInt32();

                state[field.name] = field.repeated
                    ? this._mergeRepeated(state[field.name], nested, payload, defaults)
                    : this._merge(state[field.name] || DeltaExtractor._createMessage(nested, defaults), nested, payload, defaults);
            } else if (field.repeated || field.scalar === ScalarType.DOUBLE || wire !== field.wireType) {
                throw new Error(`Unsupported wire type [ ${wire} ] for field [ ${field.name} ]`);
            } else {
                state[field.name] = decoder.readScalar(field, reader);
            }
        }

        this._seek(end);

        return state;
    }

    /**
     * @protected
     * @param {Array<ProtoState>|undefined} previous
     * @param {ProtoDecoder} decoder
     * @param {number} length
     * @param {boolean} defaults
     * @returns {Array<ProtoState>}
     */
    _mergeRepeated(previous, decoder, length, defaults) {
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

            if (wire !== WireType.LengthDelimited) {
                throw new Error(`Unsupported wire type [ ${wire} ] in a repeated field`);
            }

            const element = reader.readUVarInt32();

            updates[index] = this._merge(previous?.[index] || DeltaExtractor._createMessage(decoder, defaults), decoder, element, defaults);

            if (index > highest) {
                highest = index;
            }
        }

        this._seek(end);

        if (declared !== null && declared < highest + 1) {
            throw new Error(`Repeated field size [ ${declared} ] is too small for index [ ${highest} ]`);
        }

        const count = declared === null ? highest + 1 : declared;
        const elements = new Array(count);

        for (let i = 0; i < count; i++) {
            elements[i] = updates[i] || previous?.[i] || DeltaExtractor._createMessage(decoder, defaults);
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
            throw new Error(`Read [ ${-remaining} ] byte(s) more than the payload has`);
        }

        this._reader.offset = end;
    }

    /**
     * @private
     * @static
     * @param {ProtoDecoder} decoder
     * @param {boolean} defaults
     * @returns {ProtoState}
     */
    static _createMessage(decoder, defaults) {
        return defaults ? decoder.create() : { };
    }
}

export default DeltaExtractor;
