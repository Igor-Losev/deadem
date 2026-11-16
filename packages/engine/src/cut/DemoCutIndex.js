import Assert from '../core/Assert.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';
import DemoPacketType from '../data/enums/DemoPacketType.js';

class DemoCutIndex {
    /** @private @type {{ first: number, stop: number }} */
    _bounds;

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

        const first = typeIds.indexOf(DemoPacketType.DEM_PACKET.id);
        const stop = typeIds.indexOf(DemoPacketType.DEM_STOP.id);

        Assert.isTrue(first !== -1, 'Unable to cut: the demo has no DEM_Packet');
        Assert.isTrue(stop > first, 'Unable to cut: the demo has no DEM_Stop after its first DEM_Packet');

        this._bounds = { first, stop };

        this._ticks = ticks;
        this._typeIds = typeIds;
    }

    /**
     * @public
     * @param {number} from - The first tick of the window.
     * @param {number} to - The last tick of the window.
     * @returns {Uint8Array} - The id of a {@link DemoCutAction} for every packet, by sequence.
     */
    getPlan(from, to) {
        const firstTick = this._ticks[this._bounds.first];
        const lastTick = this._ticks[this._bounds.stop - 1];

        Assert.isTrue(Number.isInteger(from) && Number.isInteger(to), `Invalid window [ ${from}, ${to} ]: ticks must be integers`);
        Assert.isTrue(from <= to, `Invalid window [ ${from}, ${to} ]: from must not exceed to`);
        Assert.isTrue(from <= lastTick && to >= firstTick, `Invalid window [ ${from}, ${to} ]: outside of the demo [ ${firstTick}, ${lastTick} ]`);

        const actions = new Uint8Array(this._typeIds.length).fill(DemoCutAction.DROP.id);

        actions.fill(DemoCutAction.KEEP.id, 0, this._bounds.first + 1);
        actions.fill(DemoCutAction.KEEP.id, this._bounds.stop);

        for (let sequence = this._bounds.first + 1; sequence < this._bounds.stop; sequence++) {
            if (this._ticks[sequence] >= from && this._ticks[sequence] <= to) {
                actions[sequence] = DemoCutAction.KEEP.id;
            }
        }

        return actions;
    }
}

export default DemoCutIndex;
