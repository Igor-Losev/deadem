class UserCommandEvent {
    /**
     * @public
     * @constructor
     * @param {UserCommand} userCommand
     * @param {number} gap
     * @param {Uint8Array|null} [delta=null] - `null` for a keyframe.
     */
    constructor(userCommand, gap, delta = null) {
        this._userCommand = userCommand;
        this._gap = gap;
        this._delta = delta;

        this._changes = null;
    }

    /**
     * @public
     * @returns {UserCommand}
     */
    get userCommand() {
        return this._userCommand;
    }

    /**
     *
     * Number of commands dropped before this one.
     * Always `0` for keyframes, which contain the complete state.
     *
     * @public
     * @returns {number}
     */
    get gap() {
        return this._gap;
    }

    /**
     * Changes per {@link UserCommand}. (Lazy).
     *
     * @public
     * @returns {Object}
     */
    getChanges() {
        if (this._changes === null) {
            this._changes = this._delta === null
                ? this._userCommand.state
                : this._userCommand.extractChanges(this._delta);
        }

        return this._changes;
    }
}

export default UserCommandEvent;
