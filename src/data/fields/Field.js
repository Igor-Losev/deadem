'use strict';

const assert = require('node:assert/strict');

const FieldType = require('./FieldType');

class Field {
    constructor(
        varName,
        varSerializer,
        sendNode,
        fieldSerializerName,
        fieldSerializerVersion,
        fieldType,
        bitCount,
        encoder,
        encoderFlags,
        valueLow,
        valueHigh
    ) {
        assert(typeof varName === 'string');
        assert(typeof varSerializer === 'string' || varSerializer === null);

        assert(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));

        assert(typeof fieldSerializerName === 'string' || fieldSerializerName === null);
        assert(Number.isInteger(fieldSerializerVersion) || fieldSerializerVersion === null);
        assert(fieldType instanceof FieldType);

        assert(Number.isInteger(bitCount) || bitCount === null);

        assert(typeof encoder === 'string' || encoder === null);
        assert(Number.isInteger(encoderFlags) || encoderFlags === null);

        assert(Number.isInteger(valueLow) || valueLow === null);
        assert(Number.isInteger(valueHigh) || valueHigh === null);

        this._varName = varName;
        this._varSerializer = varSerializer;

        this._sendNode = sendNode;

        this._fieldSerializerName = fieldSerializerVersion;
        this._fieldSerializerVersion = fieldSerializerVersion;
        this._fieldType = fieldType;

        this._bitCount = bitCount;

        this._encoder = encoder;
        this._encoderFlags = encoderFlags;

        this._valueLow = valueLow;
        this._valueHigh = valueHigh;
    }

    get fieldType() {
        return this._fieldType;
    }

    /**
     * @public
     * @static
     * @param {ProtoFlattenedSerializerField_t} fieldRaw
     * @param {Array<String>} symbols
     */
    static parse(fieldRaw, symbols) {
        const has = key => Object.hasOwn(fieldRaw, key);
        const get = (value, predicate, fallback) => predicate(value) ? value : fallback;

        const varName = symbols[fieldRaw.varNameSym];
        const varSerializer = get(symbols[fieldRaw.varSerializerSym], v => has('varSerializerSym') && typeof v === 'string', null);

        const varType = symbols[fieldRaw.varTypeSym];

        const sendNode = symbols[fieldRaw.sendNodeSym].split('.').filter(s => s);

        const fieldSerializerName = get(symbols[fieldRaw.fieldSerializerNameSym], v => has('fieldSerializerNameSym') && typeof v === 'string', null);
        const fieldSerializerVersion = get(fieldRaw.fieldSerializerVersion, v => has('fieldSerializerVersion') && Number.isInteger(v), null);
        const fieldType = FieldType.parse(symbols[fieldRaw.varTypeSym]);

        const bitCount = get(fieldRaw.bitCount, v => has('bitCount') && Number.isInteger(v), null);

        const encoder = get(symbols[fieldRaw.varEncoderSym], v => has('varEncoderSym') && typeof v === 'string', null);
        const encoderFlags = get(fieldRaw.encodeFlags, v => has('encodeFlags') && Number.isInteger(v), null);

        const valueLow = get(fieldRaw.lowValue, v => has('lowValue') && Number.isInteger(v), null);
        const valueHigh = get(fieldRaw.highValue, v => has('highValue') && Number.isInteger(v), null);

        // TODO: polymorphic types

        return new Field(
            varName,
            varSerializer,

            sendNode,

            fieldSerializerName,
            fieldSerializerVersion,
            fieldType,

            bitCount,

            encoder,
            encoderFlags,

            valueLow,
            valueHigh
        );
    }
}

module.exports = Field;
