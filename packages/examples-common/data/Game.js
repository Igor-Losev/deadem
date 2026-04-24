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
}

const deadlock = new Game('deadlock');
const dota2 = new Game('dota2');

export default Game;
