import { InterceptorStage } from 'deadem';

import GameState from './GameState';

const GAME_RULES_CLASS_NAME = 'CCitadelGameRulesProxy';
const NOT_AVAILABLE = 'N/A';
const SECONDS_IN_MINUTE = 60;

class GameObserver {
    /**
     * @constructor
     * @param {Parser} parser
     * @param {number} [frequency=1]
     */
    constructor(parser, frequency = 1) {
        this._parser = parser;
        this._frequency = frequency;

        this._gameRulesEntityIndex = null;
        this._last = null;

        this._game = {
            clockGame: 0,
            clockTotal: 0,
            paused: false,
            state: null,
            tick: null
        };

        this._initialize();
    }

    /**
     * @public
     * @returns {Game} 
     */
    get game() {
        return this._game;
    }

    /** 
     * @public
     */
    forceUpdate() {
        this._forceUpdate();
    }

    /**
     * @public
     * @returns {GameFormatted} 
     */
    getGameFormatted() {
        return {
            clockGame: formatClock(this._game.clockGame),
            clockTotal: formatClock(this._game.clockTotal),
            paused: this._game.paused ? 'PAUSED' : 'UNPAUSED',
            state: this._game.state !== null ? this._game.state.name : NOT_AVAILABLE,
            tick: this._game.tick !== null ? this._game.tick.toString() : NOT_AVAILABLE
        };
    }

    /** 
     * @protected
     */
    /**  */
    _forceUpdate() {
        if (this._last === null) {
            return;
        }

        const gameTick = this._last.tick;

        this._game.tick = gameTick;

        if (this._gameRulesEntityIndex === null) {
            return;
        }

        const demo = this._parser.getDemo();

        if (demo.server === null) {
            return;
        }

        const gameRules = demo.getEntity(this._gameRulesEntityIndex);
        const gameRulesData = gameRules.unpackFlattened();

        const gamePaused = gameRulesData['m_pGameRules.m_bGamePaused'] || false;
        const gameState = GameState.parse(gameRulesData['m_pGameRules.m_eGameState']);

        if (!gamePaused) {
            const clockLastUpdatedAt = gameRulesData['m_pGameRules.m_flMatchClockAtLastUpdate'];
            const clockLastUpdatedTick = gameRulesData['m_pGameRules.m_nMatchClockUpdateTick'];

            let elapsed;

            if (gameState === GameState.POST_GAME) {
                elapsed = 0;
            } else {
                elapsed = (gameTick - clockLastUpdatedTick) * demo.server.tickInterval;
            }

            this._game.clockGame = clockLastUpdatedAt + elapsed;
        }

        this._game.clockTotal = gameTick / demo.server.tickRate;
        this._game.paused = gamePaused;
        this._game.state = gameState;
    }

    /**
     * @protected
     */
    _initialize() {
        const interceptorForInitialization = () => {
            const entities = this._parser.getDemo().getEntitiesByClassName(GAME_RULES_CLASS_NAME);

            if (entities.length === 0) {
                return;
            }

            this._gameRulesEntityIndex = entities[0].index;

            unregisterInterceptorForInitialization();
        };

        const unregisterInterceptorForInitialization = () => this._parser.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForInitialization);

        const interceptorForGameData = (demoPacket) => {
            this._last = demoPacket;

            if (demoPacket.sequence % this._frequency === 0) {
                this.forceUpdate();
            }
        };

        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForInitialization);
        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForGameData);
    }
}

/**
 * @param {number} clock
 * @returns {string}
 */
function formatClock(clock) {
    const minutes = clock / SECONDS_IN_MINUTE;
    const fullMinutes = Math.floor(minutes);

    const seconds = minutes - fullMinutes;
    const fullSeconds = Math.floor(SECONDS_IN_MINUTE * seconds);

    const fullMinutesFormatted = fullMinutes.toString().padStart(2, '0');
    const fullSecondsFormatted = fullSeconds.toString().padStart(2, '0');

    return `${fullMinutesFormatted}:${fullSecondsFormatted}`;
}

/**
 * @typedef {Object} Game
 * @property {number} clockGame
 * @property {number} clockTotal
 * @property {boolean} paused
 * @property {GameState|null} state
 * @property {number|null} tick
 */

/**
 * @typedef {Object} GameFormatted
 * @property {string} clockGame
 * @property {string} clockTotal
 * @property {string} paused
 * @property {string} state
 * @property {string} tick
 */

export default GameObserver;
