'use strict';

const assert = require('node:assert/strict');

const BitBuffer = require('./../buffer/BitBufferFast');

const FieldPathBuilder = require('../fields/path/FieldPathBuilder');

const registry = {
    byCode: new Map()
};

class FieldPathOperation {
    /**
     * @public
     * @constructor
     * @param {String} code
     * @param {String} name
     * @param {Number} weight
     * @param {Number} sequence
     * @param {Function|null} executor
     */
    constructor(code, name, weight, sequence, executor) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof name === 'string' && name.length > 0);
        assert(Number.isInteger(weight));
        assert(Number.isInteger(sequence));
        assert(executor === null || typeof executor === 'function');

        this._code = code;
        this._name = name;
        this._weight = weight;
        this._sequence = sequence;
        this._executor = executor;

        registry.byCode.set(code, this);
    }

    /**
     * @public
     * @static
     * @returns {Array<FieldPathOperation>}
     */
    static getAll() {
        return Array.from(registry.byCode.values());
    }

    get code() {
        return this._code
    }

    get name() {
        return this._name;
    }

    get weight() {
        return this._weight;
    }

    get sequence() {
        return this._sequence;
    }

    get executor() {
        return this._executor;
    }

    /**
     * @public
     * @static
     * @returns {FieldPathOperation}
     */
    static get FINISH() {
        return finish;
    }
}

const executor = (callback) => (bitBuffer, fieldPathBuilder) => {
    assert(bitBuffer instanceof BitBuffer);
    assert(fieldPathBuilder instanceof FieldPathBuilder);

    callback(bitBuffer, fieldPathBuilder);
};

const plusOne = new FieldPathOperation('PLUS_1', 'PlusOne', 36271, 0, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
}));
const plusTwo = new FieldPathOperation('PLUS_2', 'PlusTwo', 10334, 1, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(2);
}));
const plusThree = new FieldPathOperation('PLUS_3', 'PlusThree', 1375, 2, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(3);
}));
const plusFour = new FieldPathOperation('PLUS_4', 'PlusFour', 646, 3, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(4);
}));
const plusN = new FieldPathOperation('PLUS_N', 'PlusN', 4128, 4, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarIntFieldPath() + 5);
}));

const pushOneLeftDeltaZeroRightZero = new FieldPathOperation('PUSH_1L_D0_R0', 'PushOneLeftDeltaZeroRightZero', 35, 5, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(0);
}));
const pushOneLeftDeltaZeroRightNonZero = new FieldPathOperation('PUSH_1L_D0_R!0', 'PushOneLeftDeltaZeroRightNonZero', 3, 6, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath());
}));
const pushOneLeftDeltaOneRightZero = new FieldPathOperation('PUSH_1L_D1_R0', 'PushOneLeftDeltaOneRightZero', 521, 7, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(0);
}));
const pushOneLeftDeltaOneRightNonZero = new FieldPathOperation('PUSH_1L_D1_R!0', 'PushOneLeftDeltaOneRightNonZero', 2942, 8, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath());
}));
const pushOneLeftDeltaNRightZero = new FieldPathOperation('PUSH_1L_DN_R0', 'PushOneLeftDeltaNRightZero', 560, 9, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarIntFieldPath());
    fieldPathBuilder.push(0);
}));
const pushOneLeftDeltaNRightNonZero = new FieldPathOperation('PUSH_1L_DN_R!0', 'PushOneLeftDeltaNRightNonZero', 471, 10, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarIntFieldPath() + 2);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath() + 1);
}));
const pushOneLeftDeltaNRightNonZeroPack6Bits = new FieldPathOperation('PUSH_1L_DN_R!0_P6B', 'PushOneLeftDeltaNRightNonZeroPack6Bits', 10530, 11, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.read(3).readUInt8() + 2);
    fieldPathBuilder.push(bitBuffer.read(3).readUInt8() + 1);
}));
const pushOneLeftDeltaNRightNonZeroPack8Bits = new FieldPathOperation('PUSH_1L_DN_R!0_P8B', 'PushOneLeftDeltaNRightNonZeroPack8Bits', 251, 12, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.read(4).readUInt8() + 2);
    fieldPathBuilder.push(bitBuffer.read(4).readUInt8() + 1);
}));

const pushTwoLeftDeltaZero = new FieldPathOperation('PUSH_2L_D0', 'PushTwoLeftDeltaZero', 0, 13, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
}));
const pushTwoPack5BitsLeftDeltaZero = new FieldPathOperation('PUSH_2P5BL_D0', 'PushTwoPack5BitsLeftDeltaZero', 0, 14, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8());
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8());
}));
const pushThreeLeftDeltaZero = new FieldPathOperation('PUSH_3L_D0', 'PushThreeLeftDeltaZero', 0, 15, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
}));
const pushThreePack5BitsLeftDeltaZero = new FieldPathOperation('PUSH_3P5BL_D0', 'PushThreePack5BitsLeftDeltaZero', 0, 16, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8());
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8());
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8());
}));
const pushTwoLeftDeltaOne = new FieldPathOperation('PUSH_2L_D1', 'PushTwoLeftDeltaOne', 0, 17, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
}));
const pushTwoPack5BitsLeftDeltaOne = new FieldPathOperation('PUSH_2P5BL_D1', 'PushTwoPack5BitsLeftDeltaOne', 0, 18, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
}));
const pushThreeLeftDeltaOne = new FieldPathOperation('PUSH_3L_D1', 'PushThreeLeftDeltaOne', 0, 19, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
}));
const pushThreePack5BitsLeftDeltaOne = new FieldPathOperation('PUSH_3P5BL_D1', 'PushThreePack5BitsLeftDeltaOne', 0, 20, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1);
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
}));
const pushTwoLeftDeltaN = new FieldPathOperation('PUSH_2L_DN', 'PushTwoLeftDeltaN', 0, 21, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarInt() + 2);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()) // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()) // ? +=
}));
const pushTwoPack5BitsLeftDeltaN = new FieldPathOperation('PUSH_2P5BL_DN', 'PushTwoPack5BitsLeftDeltaN', 0, 22, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarInt() + 2);
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
}));
const pushThreeLeftDeltaN = new FieldPathOperation('PUSH_3L_DN', 'PushThreeLeftDeltaN', 0, 23, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarInt() + 2);
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()) // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()) // ? +=
    fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()) // ? +=
}));
const pushThreePack5BitsLeftDeltaN = new FieldPathOperation('PUSH_3P5BL_DN', 'PushThreePack5BitsLeftDeltaN', 0, 24, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(bitBuffer.readUVarInt() + 2);
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
    fieldPathBuilder.push(bitBuffer.read(5).readUInt8()); // ? +=
}));

const pushN = new FieldPathOperation('PUSH_N', 'PushN', 0, 25, executor((bitBuffer, fieldPathBuilder) => {
    const count = bitBuffer.readUVarInt();

    fieldPathBuilder.add(bitBuffer.readUVarInt());

    for (let i = 0; i < count; i++) {
        fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath()); // ? +=
    }
}));
const pushNAndNonTopological = new FieldPathOperation('PUSH_N_!N', 'PushNAndNonTopological', 310, 26, executor((bitBuffer, fieldPathBuilder) => {
    for (let i = 0; i < fieldPathBuilder.length; i++) {
        if (bitBuffer.readBit()) {
            fieldPathBuilder.add(bitBuffer.readUVarInt32() + 1, i);
        }
    }

    const count = bitBuffer.readUVarInt();

    for (let i = 0; i < count; i++) {
        fieldPathBuilder.push(bitBuffer.readUVarIntFieldPath());
    }
}));

const popOnePlusOne = new FieldPathOperation('POP_1_PLUS_1', 'PopOnePlusOne', 2, 27, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(1);
    fieldPathBuilder.add(1);
}));
const popOnePlusN = new FieldPathOperation('POP_1_PLUS_N', 'PopOnePlusN', 0, 28, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(1);
    fieldPathBuilder.add(bitBuffer.readUVarIntFieldPath() + 1);
}));

const popAllButOnePlusOne = new FieldPathOperation('POP_ALL-1_PLUS_1', 'PopAllButOnePlusOne', 1837, 29, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(fieldPathBuilder.length - 1);
    fieldPathBuilder.add(1);
}));
const popAllButOnePlusN = new FieldPathOperation('POP_ALL-1_PLUS_N', 'PopAllButOnePlusN', 149, 30, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(fieldPathBuilder.length - 1);
    fieldPathBuilder.add(bitBuffer.readUVarIntFieldPath() + 1);
}));
const popAllButOnePlusNPack3Bits = new FieldPathOperation('POP_ALL-1_PLUS_N_P3B', 'PopAllButOnePlusNPack3Bits', 300, 31, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(fieldPathBuilder.length - 1);
    fieldPathBuilder.add(bitBuffer.read(3).readUInt8() + 1);
}));
const popAllButOnePlusNPack6Bits = new FieldPathOperation('POP_ALL-1_PLUS_N_P6B', 'PopAllButOnePlusNPack6Bits', 634, 32, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(fieldPathBuilder.length - 1);
    fieldPathBuilder.add(bitBuffer.read(6).readUInt8() + 1);
}));

const popNPlusOne = new FieldPathOperation('POP_N_PLUS_1', 'PopNPlusOne', 0, 33, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(bitBuffer.readUVarIntFieldPath());
    fieldPathBuilder.add(1);
}));
const popNPlusN = new FieldPathOperation('POP_N_PLUS_N', 'PopNPlusN', 0, 34, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(bitBuffer.readUVarIntFieldPath());
    fieldPathBuilder.add(bitBuffer.readUVarInt32());
}));
const popNAndNonTopographical = new FieldPathOperation('POP_N_!N', 'PopNAndNonTopographical', 1, 35, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.drop(bitBuffer.readUVarIntFieldPath());

    for (let i = 0; i < fieldPathBuilder.length; i++) {
        if (bitBuffer.readBit()) {
            fieldPathBuilder.add(bitBuffer.readUVarInt32());
        }
    }
}));

const nonTopoComplex = new FieldPathOperation('NON_TOPO_COMPLEX', 'NonTopoComplex', 76, 36, executor((bitBuffer, fieldPathBuilder) => {
    for (let i = 0; i < fieldPathBuilder.length; i++) { // ? CHANGED
        if (bitBuffer.readBit()) {
            fieldPathBuilder.add(bitBuffer.readUVarInt32(), i);
        }
    }
}));
const nonTopoPenultimatePlusOne = new FieldPathOperation('NON_TOPO_PEN_PLUS_1', 'NonTopoPenultimatePlusOne', 271, 37, executor((bitBuffer, fieldPathBuilder) => {
    fieldPathBuilder.add(1, fieldPathBuilder.length - 2);
}));
const nonTopoComplexPack4Bits = new FieldPathOperation('NON_TOPO_COMPLEX_P4B', 'NonTopoComplexPack4Bits', 99, 38, executor((bitBuffer, fieldPathBuilder) => {
    for (let i = 0; i < fieldPathBuilder.length; i++) {
        if (bitBuffer.readBit()) {
            fieldPathBuilder.add(bitBuffer.read(4).readUInt8() - 7);
        }
    }
}));

const finish = new FieldPathOperation('FINISH', 'Finish', 25474, 39, null);

module.exports = FieldPathOperation;
