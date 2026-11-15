/** @import Demo from '../data/Demo.js' */
/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import StringTableHandler from '../handlers/StringTableHandler.js' */
/** @import StringTableMutationEvent from '../data/tables/string/StringTableMutationEvent.js' */
/** @import DemoPacketProcessor from '../processing/DemoPacketProcessor.js' */

import Assert from '../core/Assert.js';
import EventLoop from '#core/EventLoop.js';

import ParserEngine from '../ParserEngine.js';

import PlayerPacketIndex from './PlayerPacketIndex.js';

/**
 * Synchronously replays indexed packets.
 */
class ReplaySession {
    /** @private */
    _aborted = false;

    /** @private @type {number} */
    _breakInterval;

    /** @private */
    _cursor = -1;

    /** @private @type {Demo} */
    _demo;

    /** @private @type {PlayerPacketIndex} */
    _index;

    /** @private */
    _lastTick = -1;

    /** @private @type {DemoPacketProcessor} */
    _processor;

    /** @private @type {StringTableHandler} */
    _stringTableHandler;

    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {PlayerPacketIndex} index
     * @param {number} breakInterval - Packets between event loop yields during a seek.
     */
    constructor(engine, index, breakInterval) {
        Assert.isTrue(engine instanceof ParserEngine, 'Invalid engine: expected an instance of ParserEngine');
        Assert.isTrue(index instanceof PlayerPacketIndex, 'Invalid index: expected an instance of PlayerPacketIndex');
        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0, 'Invalid breakInterval: expected a positive integer');

        this._breakInterval = breakInterval;
        this._demo = engine.demo;
        this._index = index;
        this._processor = engine.processor;
        this._stringTableHandler = engine.getStringTableHandler();
    }

    /**
     * @public
     * @returns {boolean}
     */
    get aborted() {
        return this._aborted;
    }

    /**
     * Position of the next packet to process.
     *
     * @public
     * @returns {number}
     */
    get cursor() {
        return this._cursor;
    }

    /**
     * Stops a seek in progress at its next yield.
     *
     * @public
     */
    abort() {
        this._aborted = true;
    }

    /**
     * @public
     * @param {number} count
     * @returns {number} Tick of the last processed packet.
     */
    process(count) {
        Assert.isTrue(Number.isInteger(count) && count >= 0, 'Invalid count: expected a non-negative integer');

        this._requireActive();

        if (this._cursor < 0) {
            throw new Error('Session has not been positioned: call seek() first');
        }

        const to = Math.min(this._cursor + count, this._index.length);

        while (this._cursor < to) {
            this._processPacket(this._index.getOrFail(this._cursor));

            this._cursor += 1;
        }

        return this._lastTick;
    }

    /**
     * Rebuilds the demo state at the tick from the nearest keyframe.
     *
     * @public
     * @param {number} tick
     * @returns {Promise<number>} Tick of the last processed packet.
     */
    async seek(tick) {
        this._requireActive();

        this._demo.reset();

        const plan = this._index.getSeekPlan(tick);

        this._lastTick = -1;
        this._processor.reset();

        for (let i = 0; i < plan.bootstrap.length; i++) {
            this._processPacket(this._index.getOrFail(plan.bootstrap[i]));
        }

        let processed = 0;

        /** @type {Array<StringTableMutationEvent>|null} */
        let snapshotEvents = this._extractSnapshots(plan.snapshots);

        for (let position = plan.from; position < plan.to; position++) {
            this._processPacket(this._index.getOrFail(position), snapshotEvents);

            snapshotEvents = null;

            processed += 1;

            if (processed % this._breakInterval === 0) {
                await EventLoop.yield();

                this._requireActive();
            }
        }

        this._cursor = plan.to;

        return this._lastTick;
    }

    /**
     * @protected
     * @param {Array<*>} snapshots
     * @returns {Array<StringTableMutationEvent>}
     */
    _extractSnapshots(snapshots) {
        /** @type {Array<StringTableMutationEvent>} */
        const events = [ ];

        for (let i = 0; i < snapshots.length; i++) {
            events.push(...this._stringTableHandler.extractSnapshot(snapshots[i]));
        }

        return events;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {Array<StringTableMutationEvent>|null} [snapshotEvents=null]
     */
    _processPacket(demoPacketRaw, snapshotEvents = null) {
        this._lastTick = demoPacketRaw.tick.value;

        this._processor.process(demoPacketRaw, snapshotEvents);
    }

    /**
     * @protected
     */
    _requireActive() {
        if (this._aborted) {
            throw new Error('Session has been aborted');
        }
    }
}

export default ReplaySession;
