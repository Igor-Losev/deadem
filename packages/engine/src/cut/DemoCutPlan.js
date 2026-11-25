/** @import StringTable from '../data/tables/string/StringTable.js' */

import Assert from '../core/Assert.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';

class DemoCutPlan {
    /** @private @type {Uint8Array} */
    _actions;

    /** @private @type {Array<StringTable>|null} */
    _snapshotTables;

    /**
     * @public
     * @constructor
     * @param {Uint8Array} actions - The id of a {@link DemoCutAction} for every packet, by sequence.
     * @param {Array<StringTable>|null} [snapshotTables=null] - The string tables before the snapshot.
     */
    constructor(actions, snapshotTables = null) {
        Assert.isTrue(actions instanceof Uint8Array, 'Invalid actions: expected a Uint8Array');
        Assert.isTrue(snapshotTables === null || Array.isArray(snapshotTables), 'Invalid snapshotTables: expected an array or null');

        this._actions = actions;
        this._snapshotTables = snapshotTables;
    }

    /**
     * @public
     * @returns {Array<StringTable>|null}
     */
    get snapshotTables() {
        return this._snapshotTables;
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
}

export default DemoCutPlan;
