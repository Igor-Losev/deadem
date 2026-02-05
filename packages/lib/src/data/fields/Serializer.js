import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import Field from './Field.js';
import SerializerKey from './SerializerKey.js';

class Serializer {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {number} version
     * @param {Array<Field>} fields
     */
    constructor(name, version, fields) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Number.isInteger(version));
        Assert.isTrue(Array.isArray(fields) && fields.every(f => f instanceof Field));

        this._key = new SerializerKey(name, version);
        this._fields = fields;

        this._decoderCache = [];
    }

    /**
     * @public
     * @returns {SerializerKey}
     */
    get key() {
        return this._key;
    }

    /**
     * @public
     * @returns {Array<Field>}
     */
    get fields() {
        return this._fields;
    }

    /**
     * Resolves the decoder function for a given field path.
     *
     * @public
     * @param {FieldPath} fieldPath
     * @param {number=} fieldPathIndex
     * @returns {FieldDecoder}
     */
    getDecoderForFieldPath(fieldPath, fieldPathIndex = 0) {
        if (fieldPathIndex === 0) {
            const cached = this._decoderCache[fieldPath.id] ?? null;

            if (cached !== null) {
                return cached;
            }
        }

        let serializer = this;
        let idx = fieldPathIndex;
        let decoder;

        for (;;) {
            const field = serializer.fields[fieldPath.path[idx]];

            idx++;

            if (field.model === FieldModel.SIMPLE || field.model === FieldModel.ARRAY_FIXED) {
                decoder = field.decoder;

                break;
            }

            if (field.model === FieldModel.ARRAY_VARIABLE) {
                decoder = (fieldPath.length - 1 === idx) ? field.decoderChild : field.decoderBase;

                break;
            }

            if (field.model === FieldModel.TABLE_FIXED) {
                if (fieldPath.length === idx) {
                    decoder = field.decoderBase;

                    break;
                }

                serializer = field.serializer;

                continue;
            }

            if (field.model === FieldModel.TABLE_VARIABLE) {
                if (fieldPath.length - 1 >= idx + 1) {
                    serializer = field.serializer;
                    idx++;

                    continue;
                }

                decoder = field.decoderBase;

                break;
            }

            throw new Error(`Unhandled model [ ${field.model} ]`);
        }

        if (fieldPathIndex === 0) {
            this._decoderCache[fieldPath.id] = decoder;
        }

        return decoder;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} [fieldPathIndex=0]
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, fieldPathIndex = 0) {
        return this._fields[fieldPath.get(fieldPathIndex)].getNameForFieldPath(fieldPath, fieldPathIndex + 1);
    }

    /**
     * Pushes a {@link Field}.
     *
     * @public
     * @param {Field} field
     */
    push(field) {
        this._fields.push(field);
    }
}

export default Serializer;
