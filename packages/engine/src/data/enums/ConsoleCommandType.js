import Assert from '../../core/Assert.js';

import ConsoleCommand from '../ConsoleCommand.js';

/**
 * @template {(...args: Array<*>) => string} [F=(...args: Array<*>) => string]
 */
class ConsoleCommandType {
    /** @private @type {string} */
    _code;

    /** @private @type {F} */
    _factory;

    /**
     * @public
     * @constructor
     * @param {string} code
     * @param {F} factory
     */
    constructor(code, factory) {
        Assert.isTrue(typeof code === 'string' && code.length > 0, 'Invalid code: expected a non-empty string');
        Assert.isTrue(typeof factory === 'function', 'Invalid factory: expected a function');

        this._code = code;
        this._factory = factory;
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @param {Parameters<F>} args
     * @returns {ConsoleCommand}
     */
    create(...args) {
        return new ConsoleCommand(this, this._factory(...args));
    }

    /**
     * Jumps replay playback to a tick.
     *
     * @internal
     * @public
     * @static
     * @returns {ConsoleCommandType<(tick: number) => string>}
     */
    static get DEMO_GOTO_TICK() {
        return demoGotoTick;
    }

    /**
     * Switches spectator camera to a player by 1-based slot.
     *
     * @public
     * @static
     * @returns {ConsoleCommandType<(slot: number) => string>}
     */
    static get SPEC_PLAYER() {
        return specPlayer;
    }
}

const demoGotoTick = new ConsoleCommandType('DEMO_GOTO_TICK', (/** @type {number} */ tick) => {
    Assert.isTrue(Number.isInteger(tick) && tick >= 0, `Invalid tick [ ${tick} ]: expected a non-negative integer`);

    return `demo_gototick ${tick}`;
});

const specPlayer = new ConsoleCommandType('SPEC_PLAYER', (/** @type {number} */ slot) => {
    Assert.isTrue(Number.isInteger(slot) && slot >= 1, `Invalid player slot [ ${slot} ]: expected a positive integer`);

    return `spec_player ${slot}`;
});

export default ConsoleCommandType;
