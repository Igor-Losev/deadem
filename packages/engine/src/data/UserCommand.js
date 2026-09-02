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
     * @param {Object} state
     * @param {protobuf.Type} type
     */
    constructor(slot, number, state, type) {
        Assert.isTrue(Number.isInteger(slot) && slot >= 0);
        Assert.isTrue(Number.isInteger(number));
        Assert.isTrue(state !== null && typeof state === 'object' && !Array.isArray(state));
        Assert.isTrue(typeof type?.decode === 'function');

        this._slot = slot;
        this._number = number;
        this._state = state;
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
     * @returns {Object}
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
        return new UserCommand(slot, number, extractState(type.decode(data), type), type);
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
     * @returns {Object}
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
    if (field.resolvedType?.fieldsArray !== undefined) {
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
 * @param {protobuf.Message} message
 * @param {protobuf.Type} type
 * @returns {Object}
 */
function extractState(message, type) {
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
