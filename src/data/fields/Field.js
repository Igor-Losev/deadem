'use strict';

const assert = require('node:assert/strict');

const FieldPath = require('./path/FieldPath');

const FieldDecoderInstructions = require('./FieldDecoderInstructions'),
    FieldType = require('./FieldType');

class Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {FieldType} type
     * @param {String|null} serializer
     * @param {String|null} serializerName
     * @param {Number|null} serializerVersion
     * @param {Array<String>} sendNode
     * @param {FieldDecoderInstructions} decoderInstructions
     */
    constructor(
        name,
        type,
        serializer,
        serializerName,
        serializerVersion,
        sendNode,
        decoderInstructions
    ) {
        assert(typeof name === 'string');
        assert(type instanceof FieldType);

        assert(serializer === null || typeof serializer === 'string');
        assert(serializerName === null || typeof serializerName === 'string');
        assert(serializerVersion === null || Number.isInteger(serializerVersion));

        assert(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));

        assert(decoderInstructions instanceof FieldDecoderInstructions);

        this._name = name;
        this._type = type;

        this._serializer = serializer;
        this._serializerName = serializerName;
        this._serializerVersion = serializerVersion;

        this._sendNode = sendNode;

        this._decoderInstructions = decoderInstructions;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {Number} index
     */
    getDecoder(fieldPath, index = 0) {

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

        const name = symbols[fieldRaw.varNameSym];
        const type = FieldType.parse(symbols[fieldRaw.varTypeSym]);

        const serializer = get(symbols[fieldRaw.varSerializerSym], v => has('varSerializerSym') && typeof v === 'string', null);
        const serializerName = get(symbols[fieldRaw.fieldSerializerNameSym], v => has('fieldSerializerNameSym') && typeof v === 'string', null);
        const serializerVersion = get(fieldRaw.fieldSerializerVersion, v => has('fieldSerializerVersion') && Number.isInteger(v), null);

        const sendNode = symbols[fieldRaw.sendNodeSym].split('.').filter(s => s.length > 0);

        const bitCount = get(fieldRaw.bitCount, v => has('bitCount') && Number.isInteger(v), null);

        const encoder = get(symbols[fieldRaw.varEncoderSym], v => has('varEncoderSym') && typeof v === 'string', null);
        const encoderFlags = get(fieldRaw.encodeFlags, v => has('encodeFlags') && Number.isInteger(v), null);

        const valueLow = get(fieldRaw.lowValue, v => has('lowValue') && typeof v === 'number', null);
        const valueHigh = get(fieldRaw.highValue, v => has('highValue') && typeof v === 'number', null);

        const instructions = new FieldDecoderInstructions(encoder, encoderFlags, bitCount, valueLow, valueHigh);

        // TODO: polymorphic types

        return new Field(
            name,
            type,
            serializer,
            serializerName,
            serializerVersion,
            sendNode,
            instructions
        );
    }
}

module.exports = Field;
