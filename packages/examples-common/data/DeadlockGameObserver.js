import { InterceptorStage, MessagePacketType } from '@deademx/engine';

import DeadlockGameState from './DeadlockGameState.js';

const GAME_RULES_CLASS_NAME = 'CCitadelGameRulesProxy';
const NOT_AVAILABLE = 'N/A';
const SECONDS_IN_MINUTE = 60;

class DeadlockGameObserver {
    /**
     * @constructor
     * @param {Parser|Player} parser
     * @param {number} [frequency=1]
     */
    constructor(parser, frequency = 1) {
        this._parser = parser;
        this._frequency = frequency;

        this._gameRulesEntityIndex = null;
        this._last = null;
        this._currentGameTick = null;

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
     * @public
     * @returns {string} 
     */
    getGameClockFormatted() {
        return formatClock(this._game.clockGame);
    }

    /**
     * @public
     * @returns {string}
     */
    getTotalClockFormatted() {
        return formatClock(this._game.clockTotal);
    }

    /** 
     * @protected
     */
    /**  */
    _forceUpdate() {
        if (this._last === null) {
            return;
        }

        const demoTick = this._last.tick;
        const gameTick = this._currentGameTick ?? demoTick;

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
        const gameState = DeadlockGameState.parse(gameRulesData['m_pGameRules.m_eGameState']);

        const clockLastUpdatedAt = gameRulesData['m_pGameRules.m_flMatchClockAtLastUpdate'];
        const clockLastUpdatedTick = gameRulesData['m_pGameRules.m_nMatchClockUpdateTick'];

        const tickInterval = demo.server.tickInterval;

        if (gameState === DeadlockGameState.POST_GAME || gamePaused) {
            this._game.clockGame = Math.max(clockLastUpdatedAt, 0);
        } else {
            const tickDelta = Math.max(gameTick - clockLastUpdatedTick, 0);
            const elapsed = tickDelta * tickInterval;

            this._game.clockGame = Math.max(clockLastUpdatedAt + elapsed, 0);
        }

        this._game.clockTotal = Math.max(demoTick * tickInterval, 0);

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

        const interceptorForGameDataPre = (demoPacket) => {
            this._last = demoPacket;

            const gameTick = getGameTick(demoPacket);

            if (gameTick !== null) {
                this._currentGameTick = gameTick;
            }
        };

        const interceptorForGameDataPost = (demoPacket) => {
            this._last = demoPacket;

            if (demoPacket.sequence % this._frequency === 0) {
                this.forceUpdate();
            }
        };

        this._parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, interceptorForGameDataPre);
        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForInitialization);
        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForGameDataPost);
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
 * @param {DemoPacket} demoPacket
 * @returns {number|null}
 */
function getGameTick(demoPacket) {
    const messagePackets = demoPacket.data?.messagePackets;

    if (!Array.isArray(messagePackets)) {
        return null;
    }

    const packetEntities = messagePackets.findLast(messagePacket => messagePacket.type === MessagePacketType.SVC_PACKET_ENTITIES);

    if (packetEntities === undefined) {
        return null;
    }

    return packetEntities.data.serverTick;
}

/**
 * @typedef {Object} Game
 * @property {number} clockGame
 * @property {number} clockTotal
 * @property {boolean} paused
 * @property {DeadlockGameState|null} state
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

export default DeadlockGameObserver;
