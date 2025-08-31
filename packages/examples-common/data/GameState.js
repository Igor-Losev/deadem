const registry = new Map();

/**
 * Represents a specific game state during the match lifecycle.
 *
 * Sourced from: `CCitadelGameRulesProxy.m_pGameRules.m_eGameState`
 */
class GameState {
    /**
     * @constructor
     * @param {number} code
     * @param {string} name
     */
    constructor(code, name) {
        this._code = code;
        this._name = name;

        registry.set(code, this);
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
     * @returns {Array<GameState>}
     */
    static getAll() {
        return Array.from(registry.values());
    }

    /**
     * @public
     * @static
     * @param {number} code
     * @returns {GameState|null}
     */
    static parse(code) {
        return registry.get(code) || null;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get INIT() {
        return stateInit;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get PLAYERS_LOADING() {
        return statePlayersLoading;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get UNKNOWN_3() {
        return stateUnknown3;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get PRE_GAME() {
        return statePreGame;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get GAME_IN_PROGRESS() {
        return stateGameInProgress;
    }

    /**
     * @public
     * @static
     * @returns {GameState}
     */
    static get POST_GAME() {
        return statePostGame;
    }
}

const stateInit = new GameState(1, 'INIT');
const statePlayersLoading = new GameState(2, 'PLAYERS_LOADING');
const stateUnknown3 = new GameState(3, 'UNKNOWN_3');
const statePreGame = new GameState(4, 'PRE_GAME');
const stateGameInProgress = new GameState(5, 'GAME_IN_PROGRESS');
const statePostGame = new GameState(6, 'POST_GAME');

export default GameState;
