const registry = new Map();
const states = [];

/**
 * Represents a Deadlock-specific game state during the match lifecycle.
 *
 * Sourced from: `CCitadelGameRulesProxy.m_pGameRules.m_eGameState`
 */
class DeadlockGameState {
    /**
     * @constructor
     * @param {number} code
     * @param {string} name
     */
    constructor(code, name) {
        this._code = code;
        this._name = name;

        registry.set(code, this);
        states.push(this);
    }

    /**
     * @public
     * @returns {number}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Array<DeadlockGameState>}
     */
    static getAll() {
        return [ ...states ];
    }

    /**
     * @public
     * @static
     * @param {number} code
     * @returns {DeadlockGameState|null}
     */
    static parse(code) {
        return registry.get(code) || null;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get INIT() {
        return stateInit;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get PLAYERS_LOADING() {
        return statePlayersLoading;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get UNKNOWN_3() {
        return stateUnknown3;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get PRE_GAME() {
        return statePreGame;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get GAME_IN_PROGRESS() {
        return stateGameInProgress;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get POST_GAME() {
        return statePostGame;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get UNKNOWN_7() {
        return stateUnknown7;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get UNKNOWN_8() {
        return stateUnknown8;
    }

    /**
     * @public
     * @static
     * @returns {DeadlockGameState}
     */
    static get UNKNOWN_11() {
        return stateUnknown11;
    }
}

const stateInit = new DeadlockGameState(1, 'INIT');
const statePlayersLoading = new DeadlockGameState(2, 'PLAYERS_LOADING');
const stateUnknown3 = new DeadlockGameState(3, 'UNKNOWN_3');
const statePreGame = new DeadlockGameState(4, 'PRE_GAME');
const stateGameInProgress = new DeadlockGameState(5, 'GAME_IN_PROGRESS');
const statePostGame = new DeadlockGameState(6, 'POST_GAME');

// Placeholder states observed in Deadlock data but not identified yet.
const stateUnknown7 = new DeadlockGameState(7, 'UNKNOWN_7');
const stateUnknown8 = new DeadlockGameState(8, 'UNKNOWN_8');
const stateUnknown11 = new DeadlockGameState(11, 'UNKNOWN_11');

export default DeadlockGameState;
