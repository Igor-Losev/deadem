class Game {
    /**
     * @constructor
     * @param {string} code
     */
    constructor(code) {
        this._code = code;
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    static get DEADLOCK() { return deadlock; }
    static get DOTA2() { return dota2; }
    static get CS2() { return cs2; }
}

const deadlock = new Game('deadlock');
const dota2 = new Game('dota2');
const cs2 = new Game('cs2');

export default Game;
