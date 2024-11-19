'use strict';

const assert = require('node:assert/strict');

const noop = () => {};

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
     * @param {Function|null} mutator
     */
    constructor(code, name, weight, sequence, mutator) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof name === 'string' && name.length > 0);
        assert(Number.isInteger(weight));
        assert(Number.isInteger(sequence));
        assert(mutator === null || typeof mutator === 'function');

        this._code = code;
        this._name = name;
        this._weight = weight;
        this._sequence = sequence;
        this._mutator = mutator;

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

    get mutator() {
        return this._mutator;
    }
}

const plusOne = new FieldPathOperation('PLUS_1', 'PlusOne', 36271, 0, noop);
const plusTwo = new FieldPathOperation('PLUS_2', 'PlusTwo', 10334, 1, noop);
const plusThree = new FieldPathOperation('PLUS_3', 'PlusThree', 1375, 2, noop);
const plusFour = new FieldPathOperation('PLUS_4', 'PlusFour', 646, 3, noop);
const plusN = new FieldPathOperation('PLUS_N', 'PlusN', 4128, 4, noop);

const pushOneLeftDeltaZeroRightZero = new FieldPathOperation('PUSH_1L_D0_R0', 'PushOneLeftDeltaZeroRightZero', 35, 5, noop);
const pushOneLeftDeltaZeroRightNonZero = new FieldPathOperation('PUSH_1L_D0_R!0', 'PushOneLeftDeltaZeroRightNonZero', 3, 6, noop);
const pushOneLeftDeltaOneRightZero = new FieldPathOperation('PUSH_1L_D1_R0', 'PushOneLeftDeltaOneRightZero', 521, 7, noop);
const pushOneLeftDeltaOneRightNonZero = new FieldPathOperation('PUSH_1L_D1_R!0', 'PushOneLeftDeltaOneRightNonZero', 2942, 8, noop);
const pushOneLeftDeltaNRightZero = new FieldPathOperation('PUSH_1L_DN_R0', 'PushOneLeftDeltaNRightZero', 560, 9, noop);
const pushOneLeftDeltaNRightNonZero = new FieldPathOperation('PUSH_1L_DN_R!0', 'PushOneLeftDeltaNRightNonZero', 471, 10, noop);
const pushOneLeftDeltaNRightNonZeroPack6Bits = new FieldPathOperation('PUSH_1L_DN_R!0_P6B', 'PushOneLeftDeltaNRightNonZeroPack6Bits', 10530, 11, noop);
const pushOneLeftDeltaNRightNonZeroPack8Bits = new FieldPathOperation('PUSH_1L_DN_R!0_P8B', 'PushOneLeftDeltaNRightNonZeroPack8Bits', 251, 12, noop);

const pushTwoLeftDeltaZero = new FieldPathOperation('PUSH_2L_D0', 'PushTwoLeftDeltaZero', 0, 13, noop);
const pushTwoPack5BitsLeftDeltaZero = new FieldPathOperation('PUSH_2P5BL_D0', 'PushTwoPack5BitsLeftDeltaZero', 0, 14, noop);
const pushThreeLeftDeltaZero = new FieldPathOperation('PUSH_3L_D0', 'PushThreeLeftDeltaZero', 0, 15, noop);
const pushThreePack5BitsLeftDeltaZero = new FieldPathOperation('PUSH_3P5BL_D0', 'PushThreePack5BitsLeftDeltaZero', 0, 16, noop);
const pushTwoLeftDeltaOne = new FieldPathOperation('PUSH_2L_D1', 'PushTwoLeftDeltaOne', 0, 17, noop);
const pushTwoPack5BitsLeftDeltaOne = new FieldPathOperation('PUSH_2P5BL_D0', 'PushTwoPack5BitsLeftDeltaOne', 0, 18, noop);
const pushThreeLeftDeltaOne = new FieldPathOperation('PUSH_3L_D1', 'PushThreeLeftDeltaOne', 0, 19, noop);
const pushThreePack5BitsLeftDeltaOne = new FieldPathOperation('PUSH_3P5BL_D1', 'PushThreePack5BitsLeftDeltaOne', 0, 20, noop);
const pushTwoLeftDeltaN = new FieldPathOperation('PUSH_2L_DN', 'PushTwoLeftDeltaN', 0, 21, noop);
const pushTwoPack5BitsLeftDeltaN = new FieldPathOperation('PUSH_2P5BL_DN', 'PushTwoPack5BitsLeftDeltaN', 0, 22, noop);
const pushThreeLeftDeltaN = new FieldPathOperation('PUSH_3L_DN', 'PushThreeLeftDeltaN', 0, 23, noop);
const pushThreePack5BitsLeftDeltaN = new FieldPathOperation('PUSH_3P5BL_DN', 'PushThreePack5BitsLeftDeltaN', 0, 24, noop);

const pushN = new FieldPathOperation('PUSH_N', 'PushN', 0, 25, noop);
const pushNAndNonTopological = new FieldPathOperation('PUSH_N_!N', 'PushNAndNonTopological', 310, 26, noop);

const popOnePlusOne = new FieldPathOperation('POP_1_PLUS_1', 'PopOnePlusOne', 2, 27, noop);
const popOnePlusN = new FieldPathOperation('POP_1_PLUS_N', 'PopOnePlusN', 0, 28, noop);

const popAllButOnePlusOne = new FieldPathOperation('POP_ALL_1_PLUS_1', 'PopAllButOnePlusOne', 1837, 29, noop);
const popAllButOnePlusN = new FieldPathOperation('POP_ALL_1_PLUS_N', 'PopAllButOnePlusN', 149, 30, noop);
const popAllButOnePlusNPack3Bits = new FieldPathOperation('POP_ALL_1_PLUS_N_P3B', 'PopAllButOnePlusNPack3Bits', 300, 31, noop);
const popAllButOnePlusNPack6Bits = new FieldPathOperation('POP_ALL_1_PLUS_N_P6B', 'PopAllButOnePlusNPack6Bits', 634, 32, noop);

const popNPlusOne = new FieldPathOperation('POP_N_PLUS_1', 'PopNPlusOne', 0, 33, noop);
const popNPlusN = new FieldPathOperation('POP_N_PLUS_N', 'PopNPlusN', 0, 34, noop);
const popNAndNonTopographical = new FieldPathOperation('POP_N_!N', 'PopNAndNonTopographical', 1, 35, noop);

const nonTopoComplex = new FieldPathOperation('NON_TOPO_COMPLEX', 'NonTopoComplex', 76, 36, noop);
const nonTopoPenultimatePlusOne = new FieldPathOperation('NON_TOPO_PEN_PLUS_1', 'NonTopoPenultimatePlusOne', 271, 37, noop);
const nonTopoComplexPack4Bits = new FieldPathOperation('NON_TOPO_COMPLEX_P4B', 'NonTopoComplexPack4Bits', 99, 38, noop);

const finish = new FieldPathOperation('FINISH', 'Finish', 25474, 39, null);

module.exports = FieldPathOperation;
