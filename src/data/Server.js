import assert from 'node:assert/strict';

class Server {
    /**
     * @public
     * @constructor
     * @param {number} maxClasses
     * @param {number} maxClients
     * @param {number} tickInterval
     */
    constructor(maxClasses, maxClients, tickInterval) {
        assert(Number.isInteger(maxClasses));
        assert(Number.isInteger(maxClients));
        assert(typeof tickInterval === 'number');

        this._maxClasses = maxClasses;
        this._maxClients = maxClients;
        this._tickInterval = tickInterval;

        this._classIdSizeBits = Math.floor(Math.log2(maxClasses)) + 1;
        this._tickRate = 1 / tickInterval;
    }

    /**
     * @public
     * @returns {number}
     */
    get classIdSizeBits() {
        return this._classIdSizeBits;
    }

    /**
     * @public
     * @returns {number}
     */
    get maxClasses() {
        return this._maxClasses;
    }

    /**
     * @public
     * @returns {number}
     */
    get maxClients() {
        return this._maxClients;
    }

    /**
     * @public
     * @returns {number}
     */
    get tickInterval() {
        return this._tickInterval;
    }

    /**
     * @public
     * @returns {number}
     */
    get tickRate() {
        return this._tickRate;
    }
}

export default Server;
