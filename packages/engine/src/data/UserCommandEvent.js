/** @import { ProtoState } from '#extractors/DeltaExtractor.js' */

/** @import UserCommand from '#data/UserCommand.js' */

class UserCommandEvent {
    /**
     * @public
     * @constructor
     * @param {UserCommand} userCommand
     * @param {number} gap
     * @param {Uint8Array|null} [delta=null] - `null` for a keyframe.
     */
    constructor(userCommand, gap, delta = null) {
        /** @private */
        this._userCommand = userCommand;
        /** @private */
        this._gap = gap;
        /** @private */
        this._delta = delta;

        /** @private @type {ProtoState|null} */
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
     * @returns {ProtoState}
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
