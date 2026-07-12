/**
 * @typedef {'paused'|'stopped'|'disposed'} PlaybackInterruptionReason
 */

class PlaybackInterruptedError extends Error {
    /**
     * @constructor
     * @param {PlaybackInterruptionReason} reason
     */
    constructor(reason) {
        super(`Playback interrupted: ${reason}`);

        this.name = 'PlaybackInterruptedError';

        this._reason = reason;
    }

    /**
     * @public
     * @returns {PlaybackInterruptionReason}
     */
    get reason() {
        return this._reason;
    }

    /**
     * @public
     * @static
     * @returns {'paused'}
     */
    static get PAUSED() {
        return 'paused';
    }

    /**
     * @public
     * @static
     * @returns {'stopped'}
     */
    static get STOPPED() {
        return 'stopped';
    }

    /**
     * @public
     * @static
     * @returns {'disposed'}
     */
    static get DISPOSED() {
        return 'disposed';
    }
}

export default PlaybackInterruptedError;
