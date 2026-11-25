/** @import StringTable from '../data/tables/string/StringTable.js' */

import Assert from '../core/Assert.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';
import DemoPacketType from '../data/enums/DemoPacketType.js';

import DemoCutPlan from './DemoCutPlan.js';

class DemoCutIndex {
    /** @private @type {{ first: number, stop: number }} */
    _bounds;

    /** @private @type {Array<number>} - The full packets, by sequence. */
    _keyframes = [ ];

    /** @private @type {Map<number, Array<StringTable>>} - The string tables before every full packet, by its sequence. */
    _stringTables;

    /** @private @type {Int32Array} */
    _ticks;

    /** @private @type {Uint8Array} */
    _typeIds;

    /**
     * @public
     * @constructor
     * @param {Uint8Array} typeIds - The type of every packet, by sequence.
     * @param {Int32Array} ticks - The tick of every packet, by sequence.
     * @param {Map<number, Array<StringTable>>} [stringTables=new Map()] - The string tables before every full packet, by its sequence.
     */
    constructor(typeIds, ticks, stringTables = new Map()) {
        Assert.isTrue(typeIds instanceof Uint8Array && ticks instanceof Int32Array, 'Invalid arguments: expected typed arrays');
        Assert.isTrue(typeIds.length === ticks.length, 'Invalid arguments: expected arrays of one length');
        Assert.isTrue(stringTables instanceof Map, 'Invalid stringTables: expected a Map');

        const first = typeIds.indexOf(DemoPacketType.DEM_PACKET.id);
        const stop = typeIds.indexOf(DemoPacketType.DEM_STOP.id);

        Assert.isTrue(first !== -1, 'Unable to cut: the demo has no DEM_Packet');
        Assert.isTrue(stop > first, 'Unable to cut: the demo has no DEM_Stop after its first DEM_Packet');

        this._bounds = { first, stop };

        this._stringTables = stringTables;
        this._ticks = ticks;
        this._typeIds = typeIds;

        for (let sequence = first + 1; sequence < stop; sequence++) {
            if (typeIds[sequence] === DemoPacketType.DEM_FULL_PACKET.id) {
                this._keyframes.push(sequence);
            }
        }
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._typeIds.length;
    }

    /**
     * @public
     * @param {number} from - The first tick of the window.
     * @param {number} to - The last tick of the window.
     * @returns {DemoCutPlan}
     */
    getPlan(from, to) {
        const firstTick = this._ticks[this._bounds.first];
        const lastTick = this._ticks[this._bounds.stop - 1];

        Assert.isTrue(Number.isInteger(from) && Number.isInteger(to), `Invalid window [ ${from}, ${to} ]: ticks must be integers`);
        Assert.isTrue(from <= to, `Invalid window [ ${from}, ${to} ]: from must not exceed to`);
        Assert.isTrue(from <= lastTick && to >= firstTick, `Invalid window [ ${from}, ${to} ]: outside of the demo [ ${firstTick}, ${lastTick} ]`);

        // Initial state - drop all
        const actions = new Uint8Array(this._typeIds.length).fill(DemoCutAction.DROP.id);

        // Keep head and tail
        actions.fill(DemoCutAction.KEEP.id, 0, this._bounds.first + 1);
        actions.fill(DemoCutAction.KEEP.id, this._bounds.stop);

        // Find the FILE_INFO
        for (let sequence = this._bounds.stop; sequence < actions.length; sequence++) {
            if (this._typeIds[sequence] === DemoPacketType.DEM_FILE_INFO.id) {
                actions[sequence] = DemoCutAction.FILE_INFO.id;
            }
        }

        // First snapshot before the window
        const keyframe = this._getKeyframeBefore(from);

        /** @type {Array<StringTable>|null} */
        let snapshotTables = null;

        if (keyframe !== null) {
            snapshotTables = this._stringTables.get(keyframe) ?? null;

            // Find the DEM_STRING_TABLES
            for (let sequence = 0; sequence < this._bounds.first; sequence++) {
                if (this._typeIds[sequence] === DemoPacketType.DEM_STRING_TABLES.id) {
                    Assert.exists(snapshotTables, `Unable to build cut plan: string tables before snapshot [ ${keyframe} ] are missing`);

                    actions[sequence] = DemoCutAction.START_TABLES.id;
                }
            }

            actions[keyframe] = DemoCutAction.SNAPSHOT.id;

            // Catch up the tables and the state between the first packet and the snapshot
            for (let sequence = this._bounds.first + 1; sequence < keyframe; sequence++) {
                if (this._typeIds[sequence] === DemoPacketType.DEM_PACKET.id || this._typeIds[sequence] === DemoPacketType.DEM_RECOVERY.id) {
                    actions[sequence] = DemoCutAction.CATCH_UP.id;
                }
            }
        }

        const startSequence = keyframe === null ? this._bounds.first + 1 : keyframe + 1;

        // Keep all between earlier snapshot and upper window bound
        for (let sequence = startSequence; sequence < this._bounds.stop; sequence++) {
            if (this._ticks[sequence] <= to) {
                actions[sequence] = DemoCutAction.KEEP.id;
            }
        }

        return new DemoCutPlan(actions, snapshotTables);
    }

    /**
     * The sequence of the full packet before the given tick, inclusive.
     *
     * @private
     * @param {number} tick
     * @returns {number|null}
     */
    _getKeyframeBefore(tick) {
        let keyframe = null;

        for (let i = 0; i < this._keyframes.length && this._ticks[this._keyframes[i]] <= tick; i++) {
            keyframe = this._keyframes[i];
        }

        return keyframe;
    }
}

export default DemoCutIndex;
