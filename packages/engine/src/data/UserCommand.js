/** @import { ProtoState } from '../extractors/DeltaExtractor.js' */

import Assert from '../core/Assert.js';

import ProtoDecoder from '../core/proto/ProtoDecoder.js';

import DeltaExtractor from '../extractors/DeltaExtractor.js';

/**
 * A user input state.
 */
class UserCommand {
    /**
     * @public
     * @constructor
     * @param {number} slot
     * @param {number} number
     * @param {ProtoState} state
     * @param {ProtoDecoder} decoder
     */
    constructor(slot, number, state, decoder) {
        Assert.isTrue(Number.isInteger(slot) && slot >= 0);
        Assert.isTrue(Number.isInteger(number));
        Assert.isTrue(state !== null && typeof state === 'object' && !Array.isArray(state));
        Assert.isTrue(decoder instanceof ProtoDecoder);

        /** @private */
        this._slot = slot;
        /** @private */
        this._number = number;
        /** @private */
        this._state = state;
        /** @private */
        this._decoder = decoder;
    }

    /**
     * @public
     * @returns {number}
     */
    get slot() {
        return this._slot;
    }

    /**
     * The number of the last command folded in.
     *
     * @public
     * @returns {number}
     */
    get number() {
        return this._number;
    }

    /**
     * @public
     * @returns {ProtoState}
     */
    get state() {
        return this._state;
    }

    /**
     * @public
     * @static
     * @param {number} slot
     * @param {number} number
     * @param {Uint8Array} data
     * @param {ProtoDecoder} decoder
     * @returns {UserCommand}
     */
    static fromData(slot, number, data, decoder) {
        return new UserCommand(slot, number, decoder.decode(data), decoder);
    }

    /**
     * @public
     * @param {number} number
     * @param {Uint8Array} deltaData
     */
    applyDelta(number, deltaData) {
        this._number = number;

        new DeltaExtractor(deltaData, this._decoder).merge(this._state);
    }

    /**
     * Extracts delta, without applying it.
     *
     * @public
     * @param {Uint8Array} deltaData
     * @returns {ProtoState}
     */
    extractChanges(deltaData) {
        return new DeltaExtractor(deltaData, this._decoder).merge({ });
    }
}

export default UserCommand;
