/** @import { ProtoState } from '#extractors/DeltaExtractor.js' */

import Assert from '#core/Assert.js';

import DeltaExtractor from '#extractors/DeltaExtractor.js';

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
     * @param {protobuf.Type} type
     */
    constructor(slot, number, state, type) {
        Assert.isTrue(Number.isInteger(slot) && slot >= 0);
        Assert.isTrue(Number.isInteger(number));
        Assert.isTrue(state !== null && typeof state === 'object' && !Array.isArray(state));
        Assert.isTrue(typeof type?.decode === 'function');

        /** @private */
        this._slot = slot;
        /** @private */
        this._number = number;
        /** @private */
        this._state = state;
        /** @private */
        this._type = type;
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
     * @param {protobuf.Type} type
     * @returns {UserCommand}
     */
    static fromData(slot, number, data, type) {
        const message = /** @type {Record<string, *>} */ (type.decode(data));

        return new UserCommand(slot, number, extractState(message, type), type);
    }

    /**
     * @public
     * @param {number} number
     * @param {Uint8Array} deltaData
     */
    applyDelta(number, deltaData) {
        this._number = number;

        new DeltaExtractor(deltaData, this._type).merge(this._state);
    }

    /**
     * Extracts delta, without applying it.
     *
     * @public
     * @param {Uint8Array} deltaData
     * @returns {ProtoState}
     */
    extractChanges(deltaData) {
        return new DeltaExtractor(deltaData, this._type).merge({ });
    }
}

/**
 * @param {*} value
 * @param {protobuf.Field} field
 * @returns {*}
 */
function convertValue(value, field) {
    if (field.resolvedType && 'fieldsArray' in field.resolvedType) {
        return extractState(value, field.resolvedType);
    }

    if (field.long) {
        return String(value);
    }

    if (field.bytes) {
        return new Uint8Array(value);
    }

    return value;
}

/**
 * @param {Record<string, *>} message
 * @param {protobuf.Type} type
 * @returns {ProtoState}
 */
function extractState(message, type) {
    /** @type {ProtoState} */
    const state = { };

    for (const field of type.fieldsArray) {
        const value = message[field.name];

        if (value === undefined || value === null) {
            continue;
        }

        if (field.repeated) {
            const items = new Array(value.length);

            for (let i = 0; i < value.length; i++) {
                items[i] = convertValue(value[i], field);
            }

            state[field.name] = items;
        } else {
            state[field.name] = convertValue(value, field);
        }
    }

    return state;
}

export default UserCommand;
