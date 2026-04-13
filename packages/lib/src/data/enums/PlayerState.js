import Assert from '#core/Assert.js';

const registry = {
    byCode: new Map()
};

class PlayerState {
    /**
     * @constructor
     * @param {string} code
     * @param {PlayerState[]} transitions
     */
    constructor(code, transitions = []) {
        Assert.isTrue(typeof code === 'string');
        Assert.isTrue(Array.isArray(transitions));

        this._code = code;
        this._transitions = transitions;

        registry.byCode.set(code, this);
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
     * @param {PlayerState} state
     * @returns {boolean}
     */
    canTransitionTo(state) {
        Assert.isTrue(state instanceof PlayerState);

        return this._transitions.includes(state);
    }

    /**
     * @public
     * @param {string} code
     * @returns {PlayerState|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @returns {PlayerState}
     */
    static get IDLE() {
        return idle;
    }

    /**
     * @public
     * @static
     * @returns {PlayerState}
     */
    static get LOADED() {
        return loaded;
    }

    /**
     * @public
     * @static
     * @returns {PlayerState}
     */
    static get PLAYING() {
        return playing;
    }

    /**
     * @public
     * @static
     * @returns {PlayerState}
     */
    static get SEEKING() {
        return seeking;
    }

    /**
     * @public
     * @static
     * @returns {PlayerState}
     */
    static get DISPOSED() {
        return disposed;
    }
}

const idle = new PlayerState('IDLE');
const loaded = new PlayerState('LOADED');
const playing = new PlayerState('PLAYING');
const seeking = new PlayerState('SEEKING');
const disposed = new PlayerState('DISPOSED');

idle._transitions = [loaded, disposed];
loaded._transitions = [playing, seeking, disposed];
playing._transitions = [loaded, disposed];
seeking._transitions = [loaded, disposed];

export default PlayerState;
