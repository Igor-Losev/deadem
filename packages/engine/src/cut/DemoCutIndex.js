/** @import StringTable from '../data/tables/string/StringTable.js' */

import Assert from '../core/Assert.js';

import ConsoleCommand from '../data/ConsoleCommand.js';

import ConsoleCommandType from '../data/enums/ConsoleCommandType.js';
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
     * @param {Array<ConsoleCommand>} [commands=[ ]] - Console commands inserted at the start of the window.
     * @returns {DemoCutPlan}
     */
    getPlan(from, to, commands = [ ]) {
        const firstTick = this._ticks[this._bounds.first];
        const lastTick = this._ticks[this._bounds.stop - 1];

        Assert.isTrue(Number.isInteger(from) && Number.isInteger(to), `Invalid window [ ${from}, ${to} ]: ticks must be integers`);
        Assert.isTrue(from <= to, `Invalid window [ ${from}, ${to} ]: from must not exceed to`);
        Assert.isTrue(from <= lastTick && to >= firstTick, `Invalid window [ ${from}, ${to} ]: outside of the demo [ ${firstTick}, ${lastTick} ]`);
        Assert.isTrue(Array.isArray(commands), 'Invalid commands: expected an array');

        for (let i = 0; i < commands.length; i++) {
            Assert.isTrue(commands[i] instanceof ConsoleCommand, `Invalid command at [ ${i} ]: expected an instance of ConsoleCommand`);
        }

        // Initial state - drop all
        const actions = new Uint8Array(this._typeIds.length).fill(DemoCutAction.DROP.id);
        const ticks = new Int32Array(this._ticks);

        // Keep head and tail
        actions.fill(DemoCutAction.KEEP.id, 0, this._bounds.first);
        actions.fill(DemoCutAction.KEEP.id, this._bounds.stop);

        // Find the FILE_INFO
        for (let sequence = this._bounds.stop; sequence < actions.length; sequence++) {
            if (this._typeIds[sequence] === DemoPacketType.DEM_FILE_INFO.id) {
                actions[sequence] = DemoCutAction.FILE_INFO.id;
            }
        }

        // First snapshot before the window
        const keyframe = from <= firstTick ? null : this._getKeyframeBefore(from);

        /** @type {Map<number, Array<ConsoleCommand>>} */
        const scheduledCommands = new Map();

        /** @type {Array<StringTable>|null} */
        let stringTables = null;

        if (keyframe !== null) {
            stringTables = this._stringTables.get(keyframe) ?? null;

            Assert.exists(stringTables, `Unable to build cut plan: string tables before snapshot [ ${keyframe} ] are missing`);

            actions[keyframe] = DemoCutAction.SNAPSHOT.id;

            // Collect state before the snapshot
            for (let sequence = this._bounds.first; sequence < keyframe; sequence++) {
                if (this._typeIds[sequence] === DemoPacketType.DEM_PACKET.id || this._typeIds[sequence] === DemoPacketType.DEM_RECOVERY.id) {
                    actions[sequence] = DemoCutAction.COLLECT_STATE.id;
                }
            }
        }

        // Find the DEM_STRING_TABLES and DEM_SYNC_TICK
        for (let sequence = 0; sequence < this._bounds.first; sequence++) {
            if (keyframe !== null && this._typeIds[sequence] === DemoPacketType.DEM_STRING_TABLES.id) {
                actions[sequence] = DemoCutAction.START_TABLES.id;
            } else if (from > firstTick && this._typeIds[sequence] === DemoPacketType.DEM_SYNC_TICK.id) {
                scheduledCommands.set(sequence, [ ConsoleCommandType.DEMO_GOTO_TICK.create(from) ]);
            }
        }

        let startSequence;
        let tailTick;

        if (keyframe === null) {
            startSequence = this._bounds.first;
            tailTick = firstTick;
        } else {
            startSequence = keyframe + 1;
            tailTick = this._ticks[keyframe];
        }

        // Keep all between earlier snapshot and upper window bound
        for (let sequence = startSequence; sequence < this._bounds.stop; sequence++) {
            if (this._ticks[sequence] <= to) {
                actions[sequence] = DemoCutAction.KEEP.id;
                tailTick = this._ticks[sequence];
            }
        }

        Assert.isTrue(tailTick >= from, `Invalid window [ ${from}, ${to} ]: no packets in range`);

        if (commands.length > 0) {
            const sequence = this._getCommandSequence(startSequence, from, to, keyframe ?? this._bounds.first);

            scheduledCommands.set(sequence, commands.slice());
        }

        ticks.fill(tailTick, this._bounds.stop);

        return new DemoCutPlan(actions, ticks, stringTables, scheduledCommands);
    }

    /**
     * The sequence after which window commands are inserted: the first DEM_Packet in [ from, to ], or the fallback.
     *
     * @private
     * @param {number} start
     * @param {number} from
     * @param {number} to
     * @param {number} fallback
     * @returns {number}
     */
    _getCommandSequence(start, from, to, fallback) {
        for (let sequence = start; sequence < this._bounds.stop; sequence++) {
            if (this._ticks[sequence] >= from && this._ticks[sequence] <= to && this._typeIds[sequence] === DemoPacketType.DEM_PACKET.id) {
                return sequence;
            }
        }

        return fallback;
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
