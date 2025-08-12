import { InterceptorStage, MessagePacketType } from '#root/index.js';

const GAME_RULES_CLASS_NAME = 'CCitadelGameRulesProxy';
const SECONDS_IN_MINUTE = 60;

class GameClockObserver {
    /**
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        this._parser = parser;

        this._clock = 0;
        this._pausesDuration = 0;

        this._gameRulesReference = null;

        this._initialize();
    }

    /**
     * @public
     * @returns {number}
     */
    get clock() {
        return this._clock;
    }

    /**
     * @public
     * @returns {number}
     */
    get pausesDuration() {
        return this._pausesDuration;
    }

    /**
     * @public
     * @returns {string}
     */
    getClockFormatted() {
        return formatClock(this._clock);
    }

    /**
     * @public
     * @returns {string}
     */
    getPausesDurationFormatted() {
        return formatClock(this._pausesDuration);
    }

    /**
     * @protected
     */
    _initialize() {
        const unregisterInterceptorForInitialization = () => this._parser.unregisterPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForInitialization);

        const interceptorForInitialization = (demoPacket) => {
            if (demoPacket.getIsInitial()) {
                return;
            }

            const demo = this._parser.getDemo();

            const entities = demo.getEntitiesByClassName(GAME_RULES_CLASS_NAME);

            if (entities.length === 0) {
                return;
            }

            this._gameRulesReference = entities[0];

            unregisterInterceptorForInitialization();
        };

        const interceptorForGameClock = (demoPacket, messagePacket) => {
            if (this._gameRulesReference === null) {
                return;
            }

            const demo = this._parser.getDemo();

            if (demo.server === null) {
                return;
            }

            if (messagePacket.type !== MessagePacketType.NET_TICK) {
                return;
            }

            const gameRulesData = this._gameRulesReference.unpackFlattened();

            const currentTick = messagePacket.data.tick;

            const clockLastUpdatedAt = gameRulesData['m_pGameRules.m_flMatchClockAtLastUpdate'];
            const clockLastUpdatedTick = gameRulesData['m_pGameRules.m_nMatchClockUpdateTick'];

            const elapsed = (currentTick - clockLastUpdatedTick) * demo.server.tickInterval;

            this._clock = clockLastUpdatedAt + elapsed;

            const totalPausedTicks = gameRulesData['m_pGameRules.m_nTotalPausedTicks'];

            this._pausesDuration = totalPausedTicks * demo.server.tickInterval;
        };

        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, interceptorForInitialization);
        this._parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, interceptorForGameClock);
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

export default GameClockObserver;
