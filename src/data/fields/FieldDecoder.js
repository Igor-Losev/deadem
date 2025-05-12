'use strict';

const assert = require('assert');

class FieldDecoder {
    /**
     * @constructor
     * @param {String} code
     * @param {(bitBuffer: BitBuffer) => any} decoder
     */
    constructor(code, decoder) {
        assert(typeof code === 'string');
        assert(typeof decoder === 'function');

        this._code = code;
        this._decoder = decoder;
    }

    /**
     * @static
     * @param {String} code
     * @param {(bitBuffer: BitBuffer) => any} decoder
     * @returns {FieldDecoder}
     */
    static delegate(code, decoder) {
        return new FieldDecoder(code, decoder);
    }

    /**
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @param {BitBuffer} bitBuffer
     */
    decode(bitBuffer) {
        return this._decoder(bitBuffer);
    }

    static get BOOLEAN() { return boolean; };
    static get COMPONENT() { return component; };
    static get COORD() { return coord; };
    static get INT_32() { return int32; };
    static get INT_64() { return int64; };
    static get NOSCALE() { return noscale; };
    static get RUNE_TIME() { return runeTime; };
    static get SIMULATION_TIME() { return simulationTime; };
    static get STRING() { return string; };
    static get UINT_32() { return uint32; };
    static get UINT_64() { return uint64; };
    static get VECTOR() { return vector; }
}

const boolean = new FieldDecoder('BOOLEAN', (bitBuffer) => {
    return bitBuffer.readBit() === 1;
});

const component = new FieldDecoder('COMPONENT', (bitBuffer) => {
    return bitBuffer.readBit();
});

const coord = new FieldDecoder('COORD', (bitBuffer) => {
    return bitBuffer.readCoord();
});

const int32 = new FieldDecoder('INT_32', (bitBuffer) => {
    return bitBuffer.readVarInt32();
});

const int64 = new FieldDecoder('INT_64', (bitBuffer) => {
    return bitBuffer.readVarInt64();
});

const noscale = new FieldDecoder('NOSCALE', (bitBuffer) => {
    return bitBuffer.read(32).readFloatLE();
});

const runeTime = new FieldDecoder('RUNE_TIME', (bitBuffer) => {
    return bitBuffer.read(4).readUInt8();
});

const simulationTime = new FieldDecoder('SIMULATION_TIME', (bitBuffer) => {
    const tick = bitBuffer.readUVarInt32();

    const TICK_RATE = 64;

    return tick / TICK_RATE;
});

const string = new FieldDecoder('STRING', (bitBuffer) => {
    return bitBuffer.readString();
});

const uint32 = new FieldDecoder('UINT_32', (bitBuffer) => {
    return bitBuffer.readUVarInt32();
});

const uint64 = new FieldDecoder('UINT_64', (bitBuffer) => {
    return bitBuffer.readUVarInt64();
});

const vector = new FieldDecoder('VECTOR', (bitBuffer) => {
    return bitBuffer.readNormal3Bit();
});

module.exports = FieldDecoder;
