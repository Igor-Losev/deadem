class PlaybackInterruptedError extends Error {
    /**
     * @constructor
     * @param {string} reason
     */
    constructor(reason) {
        super(`Playback interrupted: ${reason}`);

        this.name = 'PlaybackInterruptedError';

        this._reason = reason;
    }

    /**
     * @public
     * @returns {string}
     */
    get reason() {
        return this._reason;
    }

    /**
     * @public
     * @static
     * @returns {string}
     */
    static get PAUSED() {
        return 'paused';
    }

    /**
     * @public
     * @static
     * @returns {string}
     */
    static get STOPPED() {
        return 'stopped';
    }

    /**
     * @public
     * @static
     * @returns {string}
     */
    static get DISPOSED() {
        return 'disposed';
    }
}

export default PlaybackInterruptedError;
