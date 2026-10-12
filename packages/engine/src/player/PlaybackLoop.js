/** @import { PlaybackInterruptionReason } from '../errors/PlaybackInterruptedError.js' */

import Assert from '../core/Assert.js';
import DeferredPromise from '../core/DeferredPromise.js';

import PlaybackInterruptedError from '../errors/PlaybackInterruptedError.js';

const FRAME_BUDGET_MILLISECONDS = 10;

/**
 * Paces tick advances by wall clock, with a time budget per frame.
 */
class PlaybackLoop {
    /**
     * @public
     * @constructor
     * @param {() => number|null} advance - Returns the new tick, or null at the end.
     * @param {number} startTick
     * @param {number} millisecondsPerTick
     */
    constructor(advance, startTick, millisecondsPerTick) {
        Assert.isTrue(typeof advance === 'function', 'Invalid advance: expected a function');
        Assert.isTrue(Number.isInteger(startTick), 'Invalid startTick: expected an integer');
        Assert.isTrue(Number.isFinite(millisecondsPerTick) && millisecondsPerTick > 0, 'Invalid millisecondsPerTick: expected a positive number');

        /** @private */
        this._advance = advance;
        /** @private */
        this._startTick = startTick;
        /** @private */
        this._millisecondsPerTick = millisecondsPerTick;

        /** @private */
        this._interrupted = false;
        /** @private @type {PlaybackInterruptionReason|null} */
        this._reason = null;
        /** @private */
        this._started = false;
        /** @private @type {ReturnType<typeof setTimeout>|null} */
        this._timer = null;
        /** @private @type {DeferredPromise<void>|null} */
        this._wake = null;
    }

    /**
     * Sets the `interrupted` flag and wakes the sleep. {@link PlaybackLoop#run} rejects with {@link PlaybackInterruptedError}.
     *
     * @public
     * @param {PlaybackInterruptionReason} reason
     */
    interrupt(reason) {
        if (this._interrupted) {
            return;
        }

        this._interrupted = true;
        this._reason = reason;

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        if (this._wake !== null) {
            this._wake.resolve();
        }
    }

    /**
     * Resolves when there are no more ticks.
     *
     * @public
     * @returns {Promise<void>}
     */
    async run() {
        if (this._started) {
            throw new Error('Playback loop has already been started');
        }

        this._started = true;

        const anchor = performance.now();

        let tick = this._startTick;

        while (true) {
            this._requireUninterrupted();

            const now = performance.now();
            const due = Math.floor((now - anchor) / this._millisecondsPerTick) + 1;
            const deadline = now + FRAME_BUDGET_MILLISECONDS;

            while (tick - this._startTick < due) {
                this._requireUninterrupted();

                const next = this._advance();

                if (next === null) {
                    return;
                }

                tick = next;

                if (performance.now() >= deadline) {
                    break;
                }
            }

            this._requireUninterrupted();

            const delay = anchor + (tick - this._startTick) * this._millisecondsPerTick - performance.now();

            await this._sleep(Math.max(delay, 0));
        }
    }

    /**
     * @protected
     */
    _requireUninterrupted() {
        if (this._interrupted) {
            throw new PlaybackInterruptedError(/** @type {PlaybackInterruptionReason} */ (this._reason));
        }
    }

    /**
     * Resolves early when interrupted.
     *
     * @protected
     * @param {number} milliseconds
     * @returns {Promise<void>}
     */
    _sleep(milliseconds) {
        const wake = new DeferredPromise();

        this._wake = wake;
        this._timer = setTimeout(() => wake.resolve(), milliseconds);

        return wake.promise;
    }
}

export default PlaybackLoop;
