import DeferredPromise from './DeferredPromise.js';

/**
 * A resumable pause latch.
 */
class PauseControl {
    /**
     * @public
     * @constructor
     */
    constructor() {
        /** @private @type {DeferredPromise<void>|null} */
        this._deferred = null;
    }

    /**
     * @public
     * @returns {DeferredPromise<void>|null}
     */
    get deferred() {
        return this._deferred;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get paused() {
        return this._deferred !== null;
    }

    /**
     * @public
     */
    pause() {
        if (this._deferred !== null) {
            throw new Error('Unable to pause: already paused');
        }

        this._deferred = /** @type {DeferredPromise<void>} */ (new DeferredPromise());
    }

    /**
     * Releases the pause, if any. Unlike {@link PauseControl#resume},
     * it is safe to call when not paused.
     *
     * @public
     */
    release() {
        if (this._deferred === null) {
            return;
        }

        this._deferred.resolve();
        this._deferred = null;
    }

    /**
     * @public
     */
    resume() {
        if (this._deferred === null) {
            throw new Error('Unable to resume: not paused');
        }

        this.release();
    }
}

export default PauseControl;
