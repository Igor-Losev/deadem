import { ConsoleCommandType as EngineConsoleCommandType } from '@deademx/engine';

class ConsoleCommandType extends EngineConsoleCommandType {
    /**
     * Selects a hero slot (0..9) in spectator mode.
     *
     * @public
     * @static
     * @returns {EngineConsoleCommandType<(index: number) => string>}
     */
    static get DOTA_SPECTATOR_HERO_INDEX() {
        return dotaSpectatorHeroIndex;
    }

    /**
     * Sets the Dota 2 spectator camera mode (0 directed, 1 free, 2 hero chase, 3 player perspective).
     *
     * @public
     * @static
     * @returns {EngineConsoleCommandType<(mode: number) => string>}
     */
    static get DOTA_SPECTATOR_MODE() {
        return dotaSpectatorMode;
    }
}

const dotaSpectatorHeroIndex = new ConsoleCommandType('DOTA_SPECTATOR_HERO_INDEX', (/** @type {number} */ index) => {
    if (!Number.isInteger(index) || index < 0 || index > 9) {
        throw new Error(`Invalid hero index [ ${index} ]: expected an integer in [ 0, 9 ]`);
    }

    return `dota_spectator_hero_index ${index}`;
});

const dotaSpectatorMode = new ConsoleCommandType('DOTA_SPECTATOR_MODE', (/** @type {number} */ mode) => {
    if (!Number.isInteger(mode) || mode < 0 || mode > 3) {
        throw new Error(`Invalid spectator mode [ ${mode} ]: expected an integer in [ 0, 3 ]`);
    }

    return `dota_spectator_mode ${mode}`;
});

export default ConsoleCommandType;
