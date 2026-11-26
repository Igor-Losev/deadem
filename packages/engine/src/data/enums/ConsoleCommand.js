import Assert from '../../core/Assert.js';

/**
 * @template {(...args: Array<*>) => string} [F=(...args: Array<*>) => string]
 */
class ConsoleCommand {
    /** @private @type {string} */
    _code;

    /** @private @type {F} */
    _formatter;

    /**
     * @public
     * @constructor
     * @param {string} code
     * @param {F} formatter
     */
    constructor(code, formatter) {
        Assert.isTrue(typeof code === 'string' && code.length > 0, 'Invalid code: expected a non-empty string');
        Assert.isTrue(typeof formatter === 'function', 'Invalid formatter: expected a function');

        this._code = code;
        this._formatter = formatter;
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
     * @returns {F}
     */
    get format() {
        return this._formatter;
    }

    /**
     * Jumps replay playback to a tick.
     *
     * @public
     * @static
     * @returns {ConsoleCommand<(tick: number) => string>}
     */
    static get DEMO_GOTO_TICK() {
        return demoGotoTick;
    }
}

const demoGotoTick = new ConsoleCommand('DEMO_GOTO_TICK', (/** @type {number} */ tick) => {
    Assert.isTrue(Number.isInteger(tick) && tick >= 0, `Invalid tick [ ${tick} ]: expected a non-negative integer`);

    return `demo_gototick ${tick}`;
});

export default ConsoleCommand;
