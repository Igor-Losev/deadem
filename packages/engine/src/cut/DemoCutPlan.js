import Assert from '../core/Assert.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';

class DemoCutPlan {
    /** @private @type {Uint8Array} */
    _actions;

    /**
     * @public
     * @constructor
     * @param {Uint8Array} actions - The id of a {@link DemoCutAction} for every packet, by sequence.
     */
    constructor(actions) {
        Assert.isTrue(actions instanceof Uint8Array, 'Invalid actions: expected a Uint8Array');

        this._actions = actions;
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
