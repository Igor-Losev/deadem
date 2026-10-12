/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';
import EventLoop from '#core/EventLoop.js';

import DemoPacketApplier from '../processing/DemoPacketApplier.js';
import DemoPacketParser from '../processing/DemoPacketParser.js';
import DemoPacketPrioritizer from '../processing/DemoPacketPrioritizer.js';

import ParserEngine from '../ParserEngine.js';

import PlayerPacketIndex from './PlayerPacketIndex.js';

/**
 * Synchronously replays indexed packets.
 */
class ReplaySession {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     * @param {PlayerPacketIndex} index
     * @param {((id: number) => boolean)|null} messagePacketFilter
     * @param {number} breakInterval - Packets between event loop yields during a seek.
     */
    constructor(engine, index, messagePacketFilter, breakInterval) {
        Assert.isTrue(engine instanceof ParserEngine, 'Invalid engine: expected an instance of ParserEngine');
        Assert.isTrue(index instanceof PlayerPacketIndex, 'Invalid index: expected an instance of PlayerPacketIndex');
        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0, 'Invalid breakInterval: expected a positive integer');

        /** @private */
        this._demo = engine.demo;
        /** @private */
        this._index = index;
        /** @private */
        this._stringTableHandler = engine.getStringTableHandler();

        /** @private */
        this._parser = new DemoPacketParser(engine.codec, messagePacketFilter, engine.getPacketTracker(), engine.getPerformanceTracker());
        /** @private */
        this._prioritizer = new DemoPacketPrioritizer(engine.getPerformanceTracker());
        /** @private */
        this._applier = new DemoPacketApplier(
            engine.getDemoPacketHandler(),
            engine.getDemoMessageHandler(),
            engine.getDemoEntityHandler(),
            engine.interceptors,
            engine.getPacketTracker(),
            engine.getPerformanceTracker()
        );

        /** @private */
        this._breakInterval = breakInterval;

        /** @private */
        this._aborted = false;
        /** @private */
        this._cursor = -1;
        /** @private */
        this._lastTick = -1;
        /** @private */
        this._ordinal = 0;
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
        this._ordinal = 0;

        for (let i = 0; i < plan.bootstrap.length; i++) {
            this._processPacket(this._index.getOrFail(plan.bootstrap[i]));
        }

        for (let i = 0; i < plan.snapshots.length; i++) {
            this._stringTableHandler.handleSnapshot(plan.snapshots[i]);
        }

        let processed = 0;

        for (let position = plan.from; position < plan.to; position++) {
            this._processPacket(this._index.getOrFail(position));

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
     * @param {DemoPacketRaw} demoPacketRaw
     */
    _processPacket(demoPacketRaw) {
        demoPacketRaw.ordinal = this._ordinal;

        this._ordinal += 1;
        this._lastTick = demoPacketRaw.tick.value;

        const demoPacket = this._parser.parse(demoPacketRaw);

        if (demoPacket === null) {
            return;
        }

        this._prioritizer.prioritize(demoPacket);

        this._applier.apply(demoPacket);
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
