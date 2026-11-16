import Assert from '../core/Assert.js';

class DemoCutIndex {
    /** @private @type {Int32Array} */
    _ticks;

    /** @private @type {Uint8Array} */
    _typeIds;

    /**
     * @public
     * @constructor
     * @param {Uint8Array} typeIds - The type of every packet, by sequence.
     * @param {Int32Array} ticks - The tick of every packet, by sequence.
     */
    constructor(typeIds, ticks) {
        Assert.isTrue(typeIds instanceof Uint8Array && ticks instanceof Int32Array, 'Invalid arguments: expected typed arrays');
        Assert.isTrue(typeIds.length === ticks.length, 'Invalid arguments: expected arrays of one length');

        this._ticks = ticks;
        this._typeIds = typeIds;
    }
}

export default DemoCutIndex;
