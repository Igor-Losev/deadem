/** @import StringTable from '../data/tables/string/StringTable.js' */

import Assert from '../core/Assert.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';

class DemoCutPlan {
    /** @private @type {Uint8Array} */
    _actions;

    /** @private @type {Array<StringTable>|null} */
    _stringTables;

    /** @private @type {Int32Array} */
    _ticks;

    /**
     * @public
     * @constructor
     * @param {Uint8Array} actions - The id of a {@link DemoCutAction} for every packet, by sequence.
     * @param {Int32Array} ticks - The tick of every packet in the cut, by sequence.
     * @param {Array<StringTable>|null} [stringTables=null] - The string tables before the snapshot.
     */
    constructor(actions, ticks, stringTables = null) {
        Assert.isTrue(actions instanceof Uint8Array && ticks instanceof Int32Array, 'Invalid arguments: expected typed arrays');
        Assert.isTrue(actions.length === ticks.length, 'Invalid arguments: expected arrays of one length');
        Assert.isTrue(stringTables === null || Array.isArray(stringTables), 'Invalid stringTables: expected an array or null');

        this._actions = actions;
        this._stringTables = stringTables;
        this._ticks = ticks;
    }

    /**
     * @public
     * @returns {Array<StringTable>|null}
     */
    get stringTables() {
        return this._stringTables;
    }

    /**
     * @public
     * @param {number} sequence
     * @returns {DemoCutAction}
     */
    getAction(sequence) {
        Assert.isTrue(sequence < this._actions.length, `Unable to cut: packet [ ${sequence} ] is beyond the loaded demo`);

        return /** @type {DemoCutAction} */ (DemoCutAction.getById(this._actions[sequence]));
    }

    /**
     * @public
     * @param {number} sequence
     * @returns {number}
     */
    getTick(sequence) {
        Assert.isTrue(sequence < this._ticks.length, `Unable to cut: packet [ ${sequence} ] is beyond the loaded demo`);

        return this._ticks[sequence];
    }
}

export default DemoCutPlan;
